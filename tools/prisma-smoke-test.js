const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  try {
    const org = await prisma.organization.findFirst();
    console.log("OK: organization.findFirst() worked.", org ? `orgId=${org.id}` : "(no org rows)");
    process.exit(0);
  } catch (e) {
    console.error("FAIL:", e.code || e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();