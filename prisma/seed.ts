import { seedSuperAdmin } from "../src/DB/index.js";
import prisma from "../src/lib/prisma.js";

async function main() {
  await seedSuperAdmin();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
