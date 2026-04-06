import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole, enforcePermission } from "@/lib/server/guards";
import { applicationVisibilityWhere } from "@/lib/server/access";
import { createAuditLog, sendNotification } from "@/lib/server/activity";

const applicationSchema = z.object({
  studentId: z.string(),
  universityId: z.string(),
  program: z.string(),
  intake: z.string(),
  status: z.enum(["DRAFT", "SUBMITTED", "OFFERED", "ENROLLED", "REJECTED"]).default("DRAFT"),
  deadline: z.string().optional(),
  notes: z.string().optional(),
  assignedSubAgentId: z.string().nullable().optional(),
});

export async function GET() {
  const session = await requireSession();
  enforcePermission(session, "applications:view");
  const applications = await prisma.application.findMany({
    where: applicationVisibilityWhere(session),
    include: { student: true, university: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent"]);
  enforcePermission(session, "applications:create");
  const parsed = applicationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const [student, university] = await Promise.all([
    prisma.student.findFirst({ where: { id: parsed.data.studentId, tenantId: session.tenantId, isDeleted: false } }),
    prisma.university.findFirst({ where: { id: parsed.data.universityId, tenantId: session.tenantId } }),
  ]);

  if (!student || !university) {
    return NextResponse.json({ error: "Student or university not found in tenant" }, { status: 404 });
  }

  const application = await prisma.application.create({
    data: {
      tenantId: session.tenantId,
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      createdById: session.userId,
      assignedSubAgentId: parsed.data.assignedSubAgentId || null,
    },
    include: { student: true, university: true },
  });

  await createAuditLog({
    tenantId: session.tenantId,
    userId: session.userId,
    description: `Created application for ${application.student.fullName}`,
    category: "APPLICATION_CREATED",
    resourceId: application.id,
    resourceType: "Application",
  });

  if (student.assignedAgentId) {
    await sendNotification({
      tenantId: session.tenantId,
      userId: student.assignedAgentId,
      title: "Application created",
      message: `${student.fullName} has a new application for ${university.name}.`,
      type: "application_update",
    });
  }

  return NextResponse.json({ application });
}
