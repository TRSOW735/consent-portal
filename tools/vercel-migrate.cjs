/* eslint-disable no-console */
"use strict";

const { spawnSync } = require("child_process");
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

function run(args, extraEnv = {}) {
  const r = spawnSync(npx, ["--yes", ...args], {
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

/**
 * Gate "pro": solo corre migraciones si RUN_MIGRATIONS=1 (lo pondremos SOLO en Vercel Production)
 * Así no dependes de System Env Vars, y en local/preview no te la lía.
 */
if (process.env.RUN_MIGRATIONS !== "1") {
  console.log("[migrate] RUN_MIGRATIONS!=1 -> skip");
  process.exit(0);
}

if (!process.env.DIRECT_URL) {
  console.error("[migrate] DIRECT_URL missing. Set it in Vercel (Production).");
  process.exit(1);
}

console.log("[migrate] prisma migrate deploy (forcing DIRECT_URL)...");
run(["prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"], {
  DATABASE_URL: process.env.DIRECT_URL,
});

console.log("[migrate] prisma generate...");
run(["prisma", "generate", "--schema", "prisma/schema.prisma"]);

console.log("[migrate] Done.");
