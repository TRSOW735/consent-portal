export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { dispatchDueDeliveries } from "@/lib/webhooks";

export async function POST() {
  const result = await dispatchDueDeliveries(25);
  return NextResponse.json({ ok: true, ...result });
}