import { PrismaClient, Prisma } from "../generated/client/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// Global serialization override for Prisma.Decimal to return numbers (floats) in JSON responses.
(Prisma.Decimal.prototype as any).toJSON = function () {
  return Number(this.toString());
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};


const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});


const adapter = new PrismaPg(pool);
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}