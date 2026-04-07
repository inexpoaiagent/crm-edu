import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";

export async function GET(request: Request) {
  const session = await requireSession();
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ students: [], universities: [], applications: [] });
  }

  const [students, universities, applications] = await Promise.all([
    prisma.student.findMany({
      where: {
        tenantId: session.tenantId,
        isDeleted: false,
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { nationality: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
      select: { id: true, fullName: true, stage: true },
    }),
    prisma.university.findMany({
      where: {
        tenantId: session.tenantId,
        OR: [{ name: { contains: q, mode: "insensitive" } }, { country: { contains: q, mode: "insensitive" } }, { language: { contains: q, mode: "insensitive" } }, { programs: { hasSome: [q] } }],
      },
      take: 6,
      select: { id: true, name: true, country: true },
    }),
    prisma.application.findMany({
      where: {
        tenantId: session.tenantId,
        OR: [
          { program: { contains: q, mode: "insensitive" } },
          { intake: { contains: q, mode: "insensitive" } },
          { student: { fullName: { contains: q, mode: "insensitive" } } },
          { university: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: 6,
      select: { id: true, program: true, status: true },
    }),
  ]);

  return NextResponse.json({ students, universities, applications });
}
