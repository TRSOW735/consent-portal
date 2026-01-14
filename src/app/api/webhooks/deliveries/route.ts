export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "all";
  const q = (url.searchParams.get("q") || "").toLowerCase();

  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (!org) return NextResponse.json({ error: "no_org" }, { status: 404 });

  const where: any = { orgId: org.id };
  if (status !== "all") where.status = status;

  const deliveries = await prisma.webhookDelivery.findMany({
    where,
    include: { endpoint: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const filtered = deliveries.filter((d) => {
    if (!q) return true;
    const hay = `${d.paymentRef} ${d.event} ${d.status} ${d.endpoint.url}`.toLowerCase();
    return hay.includes(q);
  });

  return NextResponse.json({
    deliveries: filtered.map((d) => ({
      id: d.id,
      event: d.event,
      status: d.status,
      attemptCount: d.attemptCount,
      nextAttemptAt: d.nextAttemptAt.toISOString(),
      deliveredAt: d.deliveredAt ? d.deliveredAt.toISOString() : null,
      paymentRef: d.paymentRef,
      endpoint: { id: d.endpointId, url: d.endpoint.url },
      lastStatus: d.lastStatus,
      lastError: d.lastError,
      lastResponse: d.lastResponse,
      createdAt: d.createdAt.toISOString(),
    })),
  });
}