export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { CopyField } from "@/components/CopyField";
import { EmptyState } from "@/components/EmptyState";

export default async function ApiKeysPage() {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  const key = org
    ? await prisma.apiKey.findFirst({ where: { orgId: org.id, revokedAt: null }, orderBy: { createdAt: "desc" } })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl font-semibold tracking-tight">API Keys</div>
        <div className="text-slate-300">Para integrar tu â€œStripe-like payments APIâ€.</div>
      </div>

      <section className="card p-6 space-y-4">
        <div className="text-xl font-semibold">Active key</div>
        {key?.key ? (
          <CopyField label="x-api-key" value={key.key} />
        ) : (
          <EmptyState title="No API key" subtitle="Crea una key con el seed (tools/seed-default-org.js)." />
        )}
        <div className="text-xs text-slate-400">
          Pro tip: en producciÃ³n no guardes keys en claro; guarda hashes + rotaciÃ³n + scopes.
        </div>
      </section>

      <section className="card p-6 space-y-3">
        <div className="text-xl font-semibold">How to use</div>
        <div className="text-sm text-slate-300">
          Endpoint: <span className="pill">POST /api/v1/payment-intents</span> con header <span className="pill">x-api-key</span>
        </div>
      </section>
    </div>
  );
}