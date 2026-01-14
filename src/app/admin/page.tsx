export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { CopyField } from "@/components/CopyField";

export default async function AdminPage() {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  const key = org
    ? await prisma.apiKey.findFirst({ where: { orgId: org.id, revokedAt: null }, orderBy: { createdAt: "desc" } })
    : null;

  const payments = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="text-slate-600 max-w-2xl">
          ConfiguraciÃ³n del negocio (recipient) + API key para integraciÃ³n B2B + Ãºltimos cobros.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold">Business</h2>
          <div className="text-sm text-slate-700 space-y-1">
            <div><b>Org:</b> {org?.name ?? "â€”"}</div>
            <div className="break-all"><b>Org ID:</b> {org?.id ?? "â€”"}</div>
            <div className="break-all"><b>Recipient:</b> {org?.recipient ?? "â€”"}</div>
          </div>
        </div>

        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold">API Key</h2>
          <CopyField label="x-api-key" value={key?.key ?? ""} />
          <div className="text-xs text-slate-500">
            RecomendaciÃ³n: en producciÃ³n, rota keys y guarda hashes (no keys en claro).
          </div>
        </div>
      </section>

      <section className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Ãšltimos cobros</h2>
          <span className="badge bg-white/60 border-white/70 text-slate-700">
            {payments.length} items
          </span>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-700">
              <tr className="border-b border-white/70">
                <th className="text-left py-2 pr-3">Fecha</th>
                <th className="text-left py-2 pr-3">Amount</th>
                <th className="text-left py-2 pr-3">Status</th>
                <th className="text-left py-2 pr-3">Reference</th>
                <th className="text-left py-2 pr-3">Signature</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.reference} className="border-b border-white/50">
                  <td className="py-2 pr-3 whitespace-nowrap">{new Date(p.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-3">{p.amount}</td>
                  <td className="py-2 pr-3">
                    {p.status === "paid" ? (
                      <span className="badge bg-solana-mint/30 border-solana-mint/60 text-slate-800">paid</span>
                    ) : (
                      <span className="badge bg-solana-cyan/25 border-solana-cyan/60 text-slate-800">pending</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 break-all">{p.reference}</td>
                  <td className="py-2 pr-3 break-all">{p.signature ?? "â€”"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}