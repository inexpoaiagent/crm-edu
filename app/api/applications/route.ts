import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const applicationSchema = z.object({
  studentId: z.string(),
  universityId: z.string(),
  program: z.string(),
  intake: z.string(),
  status: z.enum(["DRAFT", "SUBMITTED", "OFFERED", "ENROLLED", "REJECTED"]),
  deadline: z.string().optional(),
  notes: z.string().optional(),
  assignedSubAgentId: z.string().optional(),
});

export async function GET() {
  const session = await requireSession();
  const applications = await prisma.application.findMany({
    where: { tenantId: session.tenantId },
    include: { student: true, university: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent"]);
  const parsed = applicationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      tenantId: session.tenantId,
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      createdById: session.userId,
    },
  });

  return NextResponse.json({ application });
}
