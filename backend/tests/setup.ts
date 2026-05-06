import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

export default async function globalSetup() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await prisma.user.deleteMany({
    where: { email: { endsWith: "@coursesphere.test" } },
  });

  await prisma.$disconnect();
  await pool.end();
}
