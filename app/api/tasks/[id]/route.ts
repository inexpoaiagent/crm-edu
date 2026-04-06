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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  await prisma.task.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    },
  });

  return NextResponse.json({ message: "Updated" });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted" });
}
