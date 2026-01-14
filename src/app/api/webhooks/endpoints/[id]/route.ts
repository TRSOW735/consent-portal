export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const Patch = z.object({
  url: z.string().url().optional(),
  enabled: z.boolean().optional(),
  events: z.array(z.string()).optional(),
});

function genSecret() {
  return crypto.randomBytes(32).toString("hex");
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = Patch.parse(await req.json());

  const updated = await prisma.webhookEndpoint.update({
    where: { id },
    data: {
      url: body.url,
      enabled: body.enabled,
      events: body.events ? body.events.join(",") : undefined,
    },
  });

  return NextResponse.json({
    ok: true,
    endpoint: {
      id: updated.id,
      url: updated.url,
      enabled: updated.enabled,
      events: updated.events.split(",").map((s) => s.trim()).filter(Boolean),
      secret: updated.secret,
    },
  });
}

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  // POST to rotate secret
  const { id } = await ctx.params;

  const updated = await prisma.webhookEndpoint.update({
    where: { id },
    data: { secret: genSecret() },
  });

  return NextResponse.json({
    ok: true,
    endpoint: {
      id: updated.id,
      secret: updated.secret,
    },
  });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await prisma.webhookEndpoint.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}