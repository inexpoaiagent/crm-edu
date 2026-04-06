import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole, enforcePermission } from "@/lib/server/guards";
import { applicationVisibilityWhere } from "@/lib/server/access";
import { createAuditLog } from "@/lib/server/activity";

const updateSchema = z.object({
  program: z.string().optional(),
  intake: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "OFFERED", "ENROLLED", "REJECTED"]).optional(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
  assignedSubAgentId: z.string().optional().or(z.literal(null)),
});

export async function GET(_request: Request, context: RouteContext<"/api/applications/[id]">) {
  const session = await requireSession();
  enforcePermission(session, "applications:view");
  const { id } = await context.params;
  const application = await prisma.application.findFirst({
    where: { ...applicationVisibilityWhere(session), id },
    include: { student: true, university: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ application });
}

export async function PATCH(request: Request, context: RouteContext<"/api/applications/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent"]);
  enforcePermission(session, "applications:update");
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.application.findFirst({
    where: { ...applicationVisibilityWhere(session), id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const application = await prisma.application.update({
    where: { id },
    data: {
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    },
  });

  await createAuditLog({
    tenantId: session.tenantId,
    userId: session.userId,
    description: `Updated application ${application.id}`,
    category: "APPLICATION_UPDATED",
    resourceId: application.id,
    resourceType: "Application",
  });

  return NextResponse.json({ application });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/applications/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  enforcePermission(session, "applications:delete");
  const { id } = await context.params;

  const existing = await prisma.application.findFirst({
    where: { tenantId: session.tenantId, id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
