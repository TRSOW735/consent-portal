import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const payments = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
  });

  return NextResponse.json({
    payments: payments.map((p) => ({
      createdAt: p.createdAt.toISOString(),
      amount: p.amount,
      status: p.status,
      reference: p.reference,
      signature: p.signature,
      recipient: p.recipient,
      memo: p.memo,
    })),
  });
}