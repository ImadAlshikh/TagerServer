import { PrismaClient } from "@prisma/client";
import env from "./env.js"
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (env.env !== "production") {
  globalForPrisma.prisma = prisma;
}
