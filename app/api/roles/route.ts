import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { enforceRole, requireSession } from "@/lib/server/guards";

const roleSchema = z.object({
  name: z.string().min(2),
  permissions: z.array(z.string()).min(1),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);

  const roles = await prisma.role.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ roles });
}

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = roleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const role = await prisma.role.create({
    data: {
      tenantId: session.tenantId,
      name: parsed.data.name,
      permissions: parsed.data.permissions,
      isDefault: parsed.data.isDefault ?? false,
    },
  });

  return NextResponse.json({ role });
}
