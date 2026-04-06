import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { enforceRole, requireSession } from "@/lib/server/guards";

const assignSchema = z.object({
  studentId: z.string(),
  scholarshipId: z.string(),
});

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent"]);
  const parsed = assignSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const [student, scholarship] = await Promise.all([
    prisma.student.findFirst({ where: { id: parsed.data.studentId, tenantId: session.tenantId, isDeleted: false } }),
    prisma.scholarship.findFirst({ where: { id: parsed.data.scholarshipId, tenantId: session.tenantId } }),
  ]);
  if (!student || !scholarship) {
    return NextResponse.json({ error: "Student or scholarship not found" }, { status: 404 });
  }

  const assignment = await prisma.studentScholarship.upsert({
    where: {
      tenantId_studentId_scholarshipId: {
        tenantId: session.tenantId,
        studentId: student.id,
        scholarshipId: scholarship.id,
      },
    },
    update: {},
    create: {
      tenantId: session.tenantId,
      studentId: student.id,
      scholarshipId: scholarship.id,
    },
  });

  return NextResponse.json({ assignment });
}
