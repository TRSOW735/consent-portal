export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const Body = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1), // e.g. ["payment.paid"]
});

function genSecret() {
  return crypto.randomBytes(32).toString("hex");
}

export async function GET() {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (!org) return NextResponse.json({ error: "no_org" }, { status: 404 });

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    endpoints: endpoints.map((e) => ({
      id: e.id,
      url: e.url,
      enabled: e.enabled,
      events: e.events.split(",").map((s) => s.trim()).filter(Boolean),
      secret: e.secret, // MVP
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (!org) return NextResponse.json({ error: "no_org" }, { status: 404 });

  const body = Body.parse(await req.json());
  const created = await prisma.webhookEndpoint.create({
    data: {
      orgId: org.id,
      url: body.url,
      secret: genSecret(),
      events: body.events.join(","),
      enabled: true,
    },
  });

  return NextResponse.json({
    ok: true,
    endpoint: {
      id: created.id,
      url: created.url,
      enabled: created.enabled,
      events: created.events.split(","),
      secret: created.secret,
    },
  });
}