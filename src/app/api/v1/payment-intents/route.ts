import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PublicKey, Keypair } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { encodeURL } from "@solana/pay";

const Body = z.object({
  amount: z.string().min(1),   // "0.01"
  memo: z.string().optional(),
  label: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key") || "";
  if (!apiKey) return NextResponse.json({ error: "missing_api_key" }, { status: 401 });

  const key = await prisma.apiKey.findUnique({ where: { key: apiKey }, include: { org: true } });
  if (!key || key.revokedAt) return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });

  const body = Body.parse(await req.json());

  const recipient = new PublicKey(key.org.recipient);
  const amount = new BigNumber(body.amount);
  const reference = Keypair.generate().publicKey;

  const url = encodeURL({
    recipient,
    amount,
    reference,
    label: body.label ?? "Consent Portal",
    message: body.message ?? "Pago",
    memo: body.memo,
  });

  await prisma.paymentRequest.create({
    data: {
      recipient: key.org.recipient,
      amount: body.amount,
      memo: body.memo,
      reference: reference.toBase58(),
      status: "pending",
      orgId: key.org.id,
    },
  });

  return NextResponse.json({
    reference: reference.toBase58(),
    url: url.toString(),
    recipient: key.org.recipient,
  });
}