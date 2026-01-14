import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PublicKey, Keypair } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { encodeURL } from "@solana/pay";

const Body = z.object({
  amount: z.string().min(1),
  memo: z.string().optional(),
});

export async function POST(req: Request) {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (!org) return NextResponse.json({ error: "no_org" }, { status: 500 });

  const body = Body.parse(await req.json());
  const recipient = new PublicKey(org.recipient);
  const amount = new BigNumber(body.amount);
  const reference = Keypair.generate().publicKey;

  const url = encodeURL({
    recipient,
    amount,
    reference,
    label: "Consent Portal",
    message: "Payment",
    memo: body.memo,
  });

  await prisma.paymentRequest.create({
    data: {
      recipient: org.recipient,
      amount: body.amount,
      memo: body.memo,
      reference: reference.toBase58(),
      status: "pending",
      orgId: org.id,
    },
  });

  return NextResponse.json({
    reference: reference.toBase58(),
    url: url.toString(),
    recipient: org.recipient,
  });
}