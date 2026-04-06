import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const universitySchema = z.object({
  name: z.string().min(2),
  country: z.enum(["Turkey", "Northern Cyprus"]),
  website: z.string().url().optional(),
  tuitionRange: z.string().optional(),
  language: z.string().min(2),
  programs: z.array(z.string()).min(1),
  deadline: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = universitySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const university = await prisma.university.create({
    data: {
      tenantId: session.tenantId,
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    },
  });

  return NextResponse.json({ university });
}

export async function GET() {
  const session = await requireSession();
  const universities = await prisma.university.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ universities });
}
