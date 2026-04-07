import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";
import { sendNotification, createAuditLog } from "@/lib/server/activity";

export async function POST() {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);

  const staleApplications = await prisma.application.findMany({
    where: {
      tenantId: session.tenantId,
      updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      status: { in: ["DRAFT", "SUBMITTED", "OFFERED"] },
    },
    include: { student: true },
    take: 30,
  });

  const unverifiedDocuments = await prisma.document.findMany({
    where: { tenantId: session.tenantId, status: { in: ["MISSING", "UPLOADED"] } },
    include: { student: true },
    take: 40,
  });

  const overdueTasks = await prisma.task.findMany({
    where: { tenantId: session.tenantId, status: "OVERDUE" },
    include: { assignedTo: true },
    take: 40,
  });

  let createdTasks = 0;
  for (const app of staleApplications) {
    const exists = await prisma.task.findFirst({
      where: {
        tenantId: session.tenantId,
        relatedStudentId: app.studentId,
        title: { contains: `SLA Follow-up: ${app.student.fullName}` },
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
    });
    if (!exists) {
      await prisma.task.create({
        data: {
          tenantId: session.tenantId,
          title: `SLA Follow-up: ${app.student.fullName}`,
          description: `Application ${app.id} has had no update for over 7 days.`,
          relatedStudentId: app.studentId,
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          priority: "HIGH",
          status: "TODO",
        },
      });
      createdTasks += 1;
    }
  }

  const recipients = await prisma.user.findMany({
    where: { tenantId: session.tenantId, role: { name: { in: ["SuperAdmin", "Admin"] } }, status: "ACTIVE", isDeleted: false },
    select: { id: true },
  });

  const alertMessage = `SLA check completed: ${staleApplications.length} stale app(s), ${unverifiedDocuments.length} unverified doc(s), ${overdueTasks.length} overdue task(s).`;
  await Promise.all(
    recipients.map((recipient) =>
      sendNotification({
        tenantId: session.tenantId,
        userId: recipient.id,
        title: "SLA automation report",
        message: alertMessage,
        type: "task_reminder",
      }),
    ),
  );

  await createAuditLog({
    tenantId: session.tenantId,
    userId: session.userId,
    description: alertMessage,
    category: "SLA_AUTOMATION",
    resourceType: "Automation",
  });

  return NextResponse.json({
    staleApplications: staleApplications.length,
    unverifiedDocuments: unverifiedDocuments.length,
    overdueTasks: overdueTasks.length,
    createdTasks,
  });
}
