import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

export async function PATCH(request: Request, context: RouteContext<"/api/scholarships/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.scholarship.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const scholarship = await prisma.scholarship.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ scholarship });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/scholarships/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const { id } = await context.params;
  const existing = await prisma.scholarship.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.scholarship.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
