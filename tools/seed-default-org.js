const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function genKey() {
  // 32 bytes -> hex (simple y robusto)
  return crypto.randomBytes(32).toString("hex");
}

async function main() {
  const recipient = process.env.DEFAULT_ORG_RECIPIENT;
  if (!recipient) throw new Error("Falta DEFAULT_ORG_RECIPIENT en .env");

  let org = await prisma.organization.findFirst({ where: { recipient } });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "Default Merchant", recipient },
    });
  }

  let apiKey = await prisma.apiKey.findFirst({ where: { orgId: org.id, revokedAt: null } });
  if (!apiKey) {
    apiKey = await prisma.apiKey.create({
      data: { key: genKey(), orgId: org.id },
    });
  }

  console.log("ORG_ID:", org.id);
  console.log("RECIPIENT:", org.recipient);
  console.log("API_KEY:", apiKey.key);
}

main().catch(e => { console.error("ERROR:", e.message || e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });