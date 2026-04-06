import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";
import { studentVisibilityWhere } from "@/lib/server/access";

const documentSchema = z.object({
  studentId: z.string(),
  type: z.enum(["PASSPORT", "DIPLOMA", "TRANSCRIPT", "ENGLISH_CERTIFICATE", "PHOTO"]),
  fileName: z.string(),
  fileUrl: z.string().url(),
  status: z.enum(["MISSING", "UPLOADED", "VERIFIED"]).default("UPLOADED"),
  expiryDate: z.string().optional(),
});

export async function GET() {
  const session = await requireSession();
  const studentWhere = studentVisibilityWhere(session);
  const visibleStudentIds = await prisma.student.findMany({
    where: studentWhere,
    select: { id: true },
  });

  const documents = await prisma.document.findMany({
    where: { tenantId: session.tenantId, studentId: { in: (visibleStudentIds as Array<{ id: string }>).map((student) => student.id) } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent", "SubAgent"]);
  const parsed = documentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, ...studentVisibilityWhere(session) },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found or access denied" }, { status: 404 });
  }

  const document = await prisma.document.create({
    data: {
      tenantId: session.tenantId,
      ...parsed.data,
      expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      uploadedById: session.userId,
    },
  });

  return NextResponse.json({ document });
}
