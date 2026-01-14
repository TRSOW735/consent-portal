export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { PaymentsClient } from "@/components/PaymentsClient";

export default async function PaymentsPage() {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  const recipient = org?.recipient ?? "";

  const payments = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
  });

  const shaped = payments.map((p) => ({
    createdAt: p.createdAt.toISOString(),
    amount: p.amount,
    status: p.status,
    reference: p.reference,
    signature: p.signature,
    recipient: p.recipient,
    memo: p.memo,
  }));

  return (
    <div className="space-y-2">
      <div className="text-3xl font-semibold tracking-tight">Dashboard</div>
      <div className="text-slate-300">
        Create payment intents, generate Solana Pay QR codes, and track settlements. (Devnet)
      </div>

      <div className="h-2" />
      <PaymentsClient recipient={recipient} initial={shaped as any} />
    </div>
  );
}