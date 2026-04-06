import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { enforceRole, requireSession } from "@/lib/server/guards";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  domain: z.string().nullable().optional(),
  locale: z.enum(["en", "tr", "fa"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: Request, context: RouteContext<"/api/tenants/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin"]);
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.tenant.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const tenant = await prisma.tenant.update({
    where: { id },
    data: {
      ...parsed.data,
      slug: parsed.data.slug?.toLowerCase(),
    },
  });

  return NextResponse.json({ tenant });
}
