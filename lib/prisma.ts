import { PrismaClient } from "@prisma/client";

declare global {
  var __crm_prisma: PrismaClient | undefined;
}

const prisma = global.__crm_prisma ?? new PrismaClient({ log: ["query", "error", "info"] });

if (process.env.NODE_ENV !== "production") {
  global.__crm_prisma = prisma;
}

export default prisma;
