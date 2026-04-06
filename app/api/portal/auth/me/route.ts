import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudentSession } from "@/lib/server/guards";

export async function GET() {
  const session = await requireStudentSession();
  const student = await prisma.student.findFirst({
    where: { id: session.student.id, tenantId: session.tenantId, isDeleted: false },
  });

  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    student: {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      stage: student.stage,
      language: "en",
    },
  });
}
