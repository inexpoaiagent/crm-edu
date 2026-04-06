import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const scholarship = await prisma.scholarship.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ scholarship });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  await prisma.scholarship.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted" });
}
