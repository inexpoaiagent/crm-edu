import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";
import { hashPassword } from "@/lib/server/password";

const stageEnum = z.enum(["LEAD", "ENROLLED", "APPLIED", "OFFERED"]);

const updateSchema = z.object({
  fullName: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  nationality: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  englishLevel: z.string().optional(),
  stage: stageEnum.optional(),
  gpa: z.number().min(0).max(4).optional(),
  assignedAgentId: z.string().optional().or(z.literal(null)),
  assignedSubAgentId: z.string().optional().or(z.literal(null)),
  username: z.string().optional(),
  password: z.string().min(6).optional(),
});

function guardStudentAccess(session: Awaited<ReturnType<typeof requireSession>>, student: Awaited<ReturnType<typeof prisma.student.findUnique>>) {
  if (!student) {
    throw NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role.name === "SubAgent" && student.assignedSubAgentId !== session.user.id) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.user.role.name === "Agent" && student.assignedAgentId !== session.user.id && student.assignedSubAgentId !== session.user.id) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return student;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const student = await prisma.student.findFirst({
    where: { id: params.id, tenantId: session.tenantId, isDeleted: false },
    include: { applications: true, documents: true },
  });

  guardStudentAccess(session, student);
  return NextResponse.json({ student });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent"]);

  const student = await prisma.student.findFirst({ where: { id: params.id, tenantId: session.tenantId, isDeleted: false } });
  guardStudentAccess(session, student);

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { password, ...rest } = parsed.data;
  const passwordHash = password ? await hashPassword(password) : undefined;
  const { stage, ...restWithoutStage } = rest;

  const updatePayload: Prisma.StudentUpdateInput = {
    ...restWithoutStage,
    username: rest.username?.toLowerCase(),
    email: rest.email?.toLowerCase(),
  };
  if (stage) {
    const parsedStage = stageEnum.safeParse(stage);
    if (parsedStage.success) {
      updatePayload.stage = parsedStage.data;
    }
  }
  if (passwordHash) updatePayload.passwordHash = passwordHash;

  const updated = await prisma.student.update({
    where: { id: params.id },
    data: updatePayload,
  });

  return NextResponse.json({ student: updated });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);

  const student = await prisma.student.findFirst({ where: { id: params.id, tenantId: session.tenantId, isDeleted: false } });
  guardStudentAccess(session, student);

  await prisma.student.update({ where: { id: params.id }, data: { isDeleted: true } });
  return NextResponse.json({ message: "Deleted" });
}
