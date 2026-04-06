import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const updateSchema = z.object({
  program: z.string().optional(),
  intake: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "OFFERED", "ENROLLED", "REJECTED"]).optional(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
  assignedSubAgentId: z.string().optional().or(z.literal(null)),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const application = await prisma.application.findFirst({
    where: { id: params.id, tenantId: session.tenantId },
    include: { student: true, university: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ application });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent"]);
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const application = await prisma.application.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    },
  });

  return NextResponse.json({ application });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  await prisma.application.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted" });
}
