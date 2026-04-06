import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  assignedToId: z.string().optional(),
  relatedStudentId: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "OVERDUE"]).optional(),
});

export async function GET() {
  const session = await requireSession();
  const tasks = await prisma.task.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { deadline: "asc" },
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent"]);
  const parsed = taskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      tenantId: session.tenantId,
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    },
  });

  return NextResponse.json({ task });
}
