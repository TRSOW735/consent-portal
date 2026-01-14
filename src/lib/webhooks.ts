import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 6;
// attempt -> delay seconds after that attempt fails
const BACKOFF = [0, 60, 300, 1800, 7200, 43200, 86400]; // 0s, 1m, 5m, 30m, 2h, 12h, 24h

export function sign(secret: string, timestamp: number, payload: string) {
  const msg = `${timestamp}.${payload}`;
  const h = crypto.createHmac("sha256", secret).update(msg).digest("hex");
  return `t=${timestamp},v1=${h}`;
}

export function hasEvent(eventsCsv: string, event: string) {
  const set = new Set(eventsCsv.split(",").map((s) => s.trim()).filter(Boolean));
  return set.has(event);
}

export async function enqueuePaymentPaid(orgId: string, payment: {
  reference: string;
  signature?: string | null;
  amount: string;
  recipient: string;
  memo?: string | null;
  createdAt: Date;
}) {
  const event = "payment.paid";
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { orgId, enabled: true },
    orderBy: { createdAt: "asc" },
  });

  const payloadBase = {
    event,
    data: {
      payment: {
        reference: payment.reference,
        signature: payment.signature ?? null,
        amount: payment.amount,
        recipient: payment.recipient,
        memo: payment.memo ?? null,
        createdAt: payment.createdAt.toISOString(),
        status: "paid",
      },
    },
  };

  for (const ep of endpoints) {
    if (!hasEvent(ep.events, event)) continue;

    const payloadJson = JSON.stringify(payloadBase);

    // idempotent via @@unique([endpointId, event, paymentRef])
    await prisma.webhookDelivery.upsert({
      where: {
        endpointId_event_paymentRef: {
          endpointId: ep.id,
          event,
          paymentRef: payment.reference,
        },
      },
      create: {
        orgId,
        endpointId: ep.id,
        event,
        paymentRef: payment.reference,
        payloadJson,
        status: "pending",
        attemptCount: 0,
        nextAttemptAt: new Date(),
      },
      update: {}, // don't duplicate
    });
  }
}

function nextDelaySeconds(attemptCount: number) {
  return BACKOFF[Math.min(attemptCount, BACKOFF.length - 1)];
}

export async function dispatchDueDeliveries(limit = 25) {
  const now = new Date();
  const due = await prisma.webhookDelivery.findMany({
    where: {
      status: { in: ["pending", "retrying"] },
      nextAttemptAt: { lte: now },
    },
    include: { endpoint: true },
    orderBy: { nextAttemptAt: "asc" },
    take: limit,
  });

  let processed = 0;

  for (const d of due) {
    processed++;

    const attempt = d.attemptCount + 1;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const payload = d.payloadJson;
    const ts = Math.floor(Date.now() / 1000);
    const signature = sign(d.endpoint.secret, ts, payload);

    try {
      await prisma.webhookDelivery.update({
        where: { id: d.id },
        data: { status: "retrying", attemptCount: attempt },
      });

      const res = await fetch(d.endpoint.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-consent-event": d.event,
          "x-consent-delivery": d.id,
          "x-consent-timestamp": String(ts),
          "x-consent-signature": signature,
        },
        body: payload,
        signal: controller.signal,
      });

      const text = await res.text().catch(() => "");
      const snippet = text ? text.slice(0, 2000) : "";

      if (res.ok) {
        await prisma.webhookDelivery.update({
          where: { id: d.id },
          data: {
            status: "success",
            deliveredAt: new Date(),
            lastStatus: res.status,
            lastError: null,
            lastResponse: snippet || null,
          },
        });
      } else {
        if (attempt >= MAX_ATTEMPTS) {
          await prisma.webhookDelivery.update({
            where: { id: d.id },
            data: {
              status: "failed",
              deliveredAt: new Date(),
              lastStatus: res.status,
              lastError: `HTTP ${res.status}`,
              lastResponse: snippet || null,
            },
          });
        } else {
          const delay = nextDelaySeconds(attempt);
          await prisma.webhookDelivery.update({
            where: { id: d.id },
            data: {
              status: "retrying",
              nextAttemptAt: new Date(Date.now() + delay * 1000),
              lastStatus: res.status,
              lastError: `HTTP ${res.status}`,
              lastResponse: snippet || null,
            },
          });
        }
      }
    } catch (e: any) {
      const msg = (e?.name === "AbortError") ? "Timeout" : (e?.message || "Network error");
      if (attempt >= MAX_ATTEMPTS) {
        await prisma.webhookDelivery.update({
          where: { id: d.id },
          data: {
            status: "failed",
            deliveredAt: new Date(),
            lastError: msg,
          },
        });
      } else {
        const delay = nextDelaySeconds(attempt);
        await prisma.webhookDelivery.update({
          where: { id: d.id },
          data: {
            status: "retrying",
            nextAttemptAt: new Date(Date.now() + delay * 1000),
            lastError: msg,
          },
        });
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return { processed };
}