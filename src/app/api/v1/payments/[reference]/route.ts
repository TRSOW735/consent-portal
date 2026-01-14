import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Connection, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { findReference, validateTransfer } from "@solana/pay";

export async function GET(_: Request, ctx: { params: Promise<{ reference: string }> }) {
  const apiKey = _.headers.get("x-api-key") || "";
  if (!apiKey) return NextResponse.json({ error: "missing_api_key" }, { status: 401 });

  const key = await prisma.apiKey.findUnique({ where: { key: apiKey }, include: { org: true } });
  if (!key || key.revokedAt) return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });

  const { reference } = await ctx.params;
  if (!reference) return NextResponse.json({ error: "missing_reference" }, { status: 400 });

  const pr = await prisma.paymentRequest.findUnique({ where: { reference } });
  if (!pr || pr.orgId !== key.org.id) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (pr.status === "paid") return NextResponse.json({ status: "paid", signature: pr.signature });

  const rpc = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpc, "confirmed");

  try {
    const refPk = new PublicKey(reference);
    const found = await findReference(connection, refPk, { finality: "confirmed" });

    await validateTransfer(
      connection,
      found.signature,
      {
        recipient: new PublicKey(pr.recipient),
        amount: new BigNumber(pr.amount),
        reference: refPk,
        memo: pr.memo ?? undefined,
      },
      { commitment: "confirmed" }
    );

    await prisma.paymentRequest.update({
      where: { reference },
      data: { status: "paid", signature: found.signature },
    });

    return NextResponse.json({ status: "paid", signature: found.signature });
  } catch {
    return NextResponse.json({ status: "pending" });
  }
}