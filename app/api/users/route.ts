import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { enforceRole, requireSession } from "@/lib/server/guards";
import { hashPassword } from "@/lib/server/password";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  roleId: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]).default("ACTIVE"),
});

export async function GET() {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);

  const users = await prisma.user.findMany({
    where: { tenantId: session.tenantId, isDeleted: false },
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role.name,
      roleId: user.roleId,
      createdAt: user.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent"]);
  const parsed = createUserSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const role = await prisma.role.findFirst({
    where: { id: parsed.data.roleId, tenantId: session.tenantId },
  });
  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  if (session.user.role.name === "Agent" && role.name !== "SubAgent") {
    return NextResponse.json({ error: "Agents can only create sub-agents" }, { status: 403 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      tenantId: session.tenantId,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      roleId: role.id,
      status: parsed.data.status,
    },
    include: { role: true },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role.name,
      roleId: user.roleId,
    },
  });
}
