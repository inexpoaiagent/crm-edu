import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudentSession } from "@/lib/server/guards";

export async function GET() {
  const session = await requireStudentSession();
  const universities = await prisma.university.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ universities });
}
