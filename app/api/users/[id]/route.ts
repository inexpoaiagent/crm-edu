import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { enforceRole, requireSession } from "@/lib/server/guards";
import { hashPassword } from "@/lib/server/password";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  roleId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]).optional(),
  password: z.string().min(6).optional(),
  isDeleted: z.boolean().optional(),
});

export async function GET(_request: Request, context: RouteContext<"/api/users/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const { id } = await context.params;

  const user = await prisma.user.findFirst({
    where: { id, tenantId: session.tenantId, isDeleted: false },
    include: { role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      roleId: user.roleId,
      role: user.role.name,
    },
  });
}

export async function PATCH(request: Request, context: RouteContext<"/api/users/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent"]);
  const { id } = await context.params;
  const parsed = updateUserSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({ where: { id, tenantId: session.tenantId, isDeleted: false }, include: { role: true } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role.name === "Agent" && existing.role.name !== "SubAgent") {
    return NextResponse.json({ error: "Agents can only update sub-agents" }, { status: 403 });
  }

  if (parsed.data.roleId) {
    const role = await prisma.role.findFirst({ where: { id: parsed.data.roleId, tenantId: session.tenantId } });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    if (session.user.role.name === "Agent" && role.name !== "SubAgent") {
      return NextResponse.json({ error: "Agents can only assign sub-agent role" }, { status: 403 });
    }
  }

  const passwordHash = parsed.data.password ? await hashPassword(parsed.data.password) : undefined;

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email?.toLowerCase(),
      roleId: parsed.data.roleId,
      status: parsed.data.status,
      isDeleted: parsed.data.isDeleted,
      ...(passwordHash ? { passwordHash } : {}),
    },
    include: { role: true },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      roleId: user.roleId,
      role: user.role.name,
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/users/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const { id } = await context.params;

  const existing = await prisma.user.findFirst({ where: { id, tenantId: session.tenantId, isDeleted: false } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id },
    data: { isDeleted: true, status: "INACTIVE" },
  });

  return NextResponse.json({ message: "User deleted" });
}
