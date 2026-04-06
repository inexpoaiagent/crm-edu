import prisma from "@/lib/prisma";

type AuditInput = {
  tenantId: string;
  userId?: string;
  description: string;
  category?: string;
  resourceId?: string;
  resourceType?: string;
};

export async function createAuditLog(input: AuditInput) {
  await prisma.auditLog.create({ data: input });
}

export async function sendNotification(input: {
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
}) {
  await prisma.notification.create({ data: input });
}
