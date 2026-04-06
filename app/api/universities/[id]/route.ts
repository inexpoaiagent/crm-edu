import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  country: z.enum(["Turkey", "Northern Cyprus"]).optional(),
  website: z.string().url().optional(),
  tuitionRange: z.string().optional(),
  language: z.string().min(2).optional(),
  programs: z.array(z.string()).min(1).optional(),
  deadline: z.string().nullable().optional(),
  description: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const university = await prisma.university.findFirst({ where: { id: params.id, tenantId: session.tenantId } });
  if (!university) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ university });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const updatePayload = {
    ...parsed.data,
    deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
  };

  const university = await prisma.university.update({
    where: { id: params.id },
    data: updatePayload,
  });

  return NextResponse.json({ university });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  await prisma.university.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Removed" });
}
