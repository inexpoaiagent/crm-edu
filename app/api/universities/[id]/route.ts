import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole, enforcePermission } from "@/lib/server/guards";

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

function normalizePrograms(programs: string[]) {
  return Array.from(new Set(programs.map((item) => item.trim()).filter(Boolean)));
}

export async function GET(_request: Request, context: RouteContext<"/api/universities/[id]">) {
  const session = await requireSession();
  enforcePermission(session, "universities:view");
  const { id } = await context.params;
  const university = await prisma.university.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      programDetails: {
        where: { tenantId: session.tenantId },
        orderBy: [{ level: "asc" }, { programName: "asc" }],
      },
    },
  });
  if (!university) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ university });
}

export async function PATCH(request: Request, context: RouteContext<"/api/universities/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  enforcePermission(session, "universities:update");
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.university.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updatePayload = {
    ...parsed.data,
    programs: parsed.data.programs ? normalizePrograms(parsed.data.programs) : undefined,
    deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
  };

  const university = await prisma.university.update({
    where: { id },
    data: updatePayload,
  });

  return NextResponse.json({ university });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/universities/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  enforcePermission(session, "universities:delete");
  const { id } = await context.params;

  const existing = await prisma.university.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.university.delete({ where: { id } });
  return NextResponse.json({ message: "Removed" });
}
