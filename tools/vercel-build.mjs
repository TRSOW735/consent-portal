import { spawnSync } from "node:child_process";

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

run("npx", ["prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"]);
run("npx", ["prisma", "generate", "--schema", "prisma/schema.prisma"]);
run("npx", ["next", "build"]);
