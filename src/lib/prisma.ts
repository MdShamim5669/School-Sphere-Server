import { PrismaClient } from "@prisma/client";
import config from "../config/index.js";

const dbUrl = (
  process.env.DATABASE_URL ||
  config.database_url ||
  "postgresql://neondb_owner:npg_ZMHWD6Swl1zb@ep-soft-snow-aeg3io1e-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
).replace(/^['"]|['"]$/g, "");

// Guarantee DATABASE_URL is set in process.env for Prisma runtime schema parsing
process.env.DATABASE_URL = dbUrl;

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasourceUrl: dbUrl,
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
