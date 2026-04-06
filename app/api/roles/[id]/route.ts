import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { enforceRole, requireSession } from "@/lib/server/guards";

const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  permissions: z.array(z.string()).min(1).optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(request: Request, context: RouteContext<"/api/roles/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const { id } = await context.params;
  const parsed = updateRoleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.role.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const role = await prisma.role.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ role });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/roles/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const { id } = await context.params;

  const existing = await prisma.role.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.name === "SuperAdmin") {
    return NextResponse.json({ error: "Cannot delete SuperAdmin role" }, { status: 400 });
  }

  await prisma.role.delete({ where: { id } });
  return NextResponse.json({ message: "Role deleted" });
}
