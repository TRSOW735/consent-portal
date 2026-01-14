import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";

const Body = z.object({
  name: z.string().min(1).max(64),
  recipient: z.string().min(32).max(64),
  rpcUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (!org) {
    return NextResponse.json({ error: "no_org" }, { status: 404 });
  }
  return NextResponse.json({
    org: {
      id: org.id,
      name: org.name,
      recipient: org.recipient,
      rpcUrl: org.rpcUrl ?? "",
    },
  });
}

export async function PUT(req: Request) {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (!org) return NextResponse.json({ error: "no_org" }, { status: 404 });

  const body = Body.parse(await req.json());

  // Validate recipient as Solana pubkey
  try { new PublicKey(body.recipient); } catch {
    return NextResponse.json({ error: "invalid_recipient" }, { status: 400 });
  }

  const updated = await prisma.organization.update({
    where: { id: org.id },
    data: {
      name: body.name,
      recipient: body.recipient,
      rpcUrl: body.rpcUrl ? body.rpcUrl : null,
    },
  });

  return NextResponse.json({
    ok: true,
    org: { id: updated.id, name: updated.name, recipient: updated.recipient, rpcUrl: updated.rpcUrl ?? "" },
  });
}