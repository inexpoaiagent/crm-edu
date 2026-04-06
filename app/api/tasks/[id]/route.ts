import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  assignedToId: z.string().optional().or(z.literal(null)),
  relatedStudentId: z.string().optional().or(z.literal(null)),
  deadline: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "OVERDUE"]).optional(),
});

export async function PATCH(request: Request, context: RouteContext<"/api/tasks/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent", "SubAgent"]);
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const task = await prisma.task.findFirst({
    where: {
      id,
      tenantId: session.tenantId,
      ...(session.user.role.name === "Agent" || session.user.role.name === "SubAgent"
        ? { assignedToId: session.userId }
        : {}),
    },
  });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.update({
    where: { id },
    data: {
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    },
  });

  return NextResponse.json({ message: "Updated" });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/tasks/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const { id } = await context.params;
  const existing = await prisma.task.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
