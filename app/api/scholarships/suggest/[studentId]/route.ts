import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";
import { studentVisibilityWhere } from "@/lib/server/access";

export async function GET(_request: Request, context: RouteContext<"/api/scholarships/suggest/[studentId]">) {
  const session = await requireSession();
  const { studentId } = await context.params;
  const student = await prisma.student.findFirst({
    where: { ...studentVisibilityWhere(session), id: studentId },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const suggestions = await prisma.scholarship.findMany({
    where: {
      tenantId: session.tenantId,
      university: {
        programs: {
          hasSome: [student.fieldOfStudy],
        },
      },
    },
    include: { university: true },
    orderBy: { discountPercentage: "desc" },
    take: 5,
  });

  return NextResponse.json({ suggestions });
}
