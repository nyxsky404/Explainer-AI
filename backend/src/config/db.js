import prismaPkg from "../../generated/prisma/index.js";
const { PrismaClient } = prismaPkg;

// Singleton pattern: reuse existing client in dev to avoid "too many connections" from hot reload
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;