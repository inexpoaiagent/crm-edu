import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const scholarshipSchema = z.object({
  title: z.string().min(3),
  universityId: z.string(),
  discountPercentage: z.number().min(0).max(100),
  description: z.string().optional(),
});

export async function GET() {
  const session = await requireSession();
  const scholarships = await prisma.scholarship.findMany({
    where: { tenantId: session.tenantId },
    include: { university: true },
  });
  return NextResponse.json({ scholarships });
}

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = scholarshipSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const scholarship = await prisma.scholarship.create({
    data: {
      tenantId: session.tenantId,
      ...parsed.data,
    },
  });

  return NextResponse.json({ scholarship });
}
