export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { WebhooksClient } from "@/components/WebhooksClient";

export default async function WebhooksPage() {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });

  if (!org) {
    return (
      <div className="card p-6">
        <div className="text-2xl font-semibold">Webhooks</div>
        <div className="text-slate-300 mt-2">
          No organization found. Create one first, then add endpoints.
        </div>
      </div>
    );
  }

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
  });

  const deliveries = await prisma.webhookDelivery.findMany({
    where: { orgId: org.id },
    include: { endpoint: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-2">
      <div className="text-3xl font-semibold tracking-tight">Webhooks</div>
      <div className="text-slate-300">
        Configure endpoints and inspect delivery attempts.
      </div>

      <div className="h-2" />
      <WebhooksClient
        initialEndpoints={endpoints.map((e) => ({
          id: e.id,
          url: e.url,
          enabled: e.enabled,
          events: e.events.split(",").map((s) => s.trim()).filter(Boolean),
          secret: e.secret,
          createdAt: e.createdAt.toISOString(),
        }))}
        initialDeliveries={deliveries.map((d) => ({
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
          createdAt: d.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}