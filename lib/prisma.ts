import { PrismaClient } from "@/app/generated/prisma/client";

declare global {
  var __crm_prisma: PrismaClient | undefined;
}

const prisma =
  global.__crm_prisma ??
  new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL ?? "",
  });

if (process.env.NODE_ENV !== "production") {
  global.__crm_prisma = prisma;
}

export default prisma;
