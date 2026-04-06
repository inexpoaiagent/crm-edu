import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { enforceRole, requireSession } from "@/lib/server/guards";

const tenantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  domain: z.string().optional(),
  locale: z.enum(["en", "tr", "fa"]).default("en"),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin"]);
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ tenants });
}

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin"]);
  const parsed = tenantSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug.toLowerCase(),
      domain: parsed.data.domain,
      locale: parsed.data.locale,
      isActive: parsed.data.isActive ?? true,
    },
  });

  return NextResponse.json({ tenant });
}
