import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireStudentSession } from "@/lib/server/guards";
import { sendNotification } from "@/lib/server/activity";

const createSchema = z.object({
  universityId: z.string(),
  program: z.string().min(2),
  intake: z.string().min(2),
  notes: z.string().optional(),
});

export async function GET() {
  const session = await requireStudentSession();
  const applications = await prisma.application.findMany({
    where: { tenantId: session.tenantId, studentId: session.student.id },
    include: { university: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const session = await requireStudentSession();
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const university = await prisma.university.findFirst({
    where: { id: parsed.data.universityId, tenantId: session.tenantId },
  });
  if (!university) {
    return NextResponse.json({ error: "University not found" }, { status: 404 });
  }

  const creator = await prisma.user.findFirst({
    where: { tenantId: session.tenantId, role: { name: "Admin" }, status: "ACTIVE", isDeleted: false },
    select: { id: true },
  });

  if (!creator) {
    return NextResponse.json({ error: "No active admin available for assignment" }, { status: 409 });
  }

  const application = await prisma.application.create({
    data: {
      tenantId: session.tenantId,
      studentId: session.student.id,
      universityId: university.id,
      program: parsed.data.program,
      intake: parsed.data.intake,
      notes: parsed.data.notes,
      status: "SUBMITTED",
      createdById: creator.id,
    },
    include: { university: true },
  });

  const admins = await prisma.user.findMany({
    where: { tenantId: session.tenantId, role: { name: { in: ["SuperAdmin", "Admin"] } }, status: "ACTIVE", isDeleted: false },
    select: { id: true },
  });
  await Promise.all(
    (admins as Array<{ id: string }>).map((admin) =>
      sendNotification({
        tenantId: session.tenantId,
        userId: admin.id,
        title: "New portal application",
        message: `${session.student.fullName} applied to ${university.name}.`,
        type: "application_update",
      }),
    ),
  );

  return NextResponse.json({ application });
}
