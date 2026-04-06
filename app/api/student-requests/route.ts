import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const requestSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(6),
  intake: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const { tenantSlug, ...rest } = payload;
  const parsed = requestSchema.safeParse(rest);
  if (!parsed.success || !tenantSlug) {
    return NextResponse.json({ error: parsed.error?.issues ?? "Invalid payload" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const studentRequest = await prisma.studentRequest.create({
    data: {
      tenantId: tenant.id,
      ...parsed.data,
    },
  });

  return NextResponse.json({ studentRequest });
}

export async function GET() {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const requests = await prisma.studentRequest.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ requests });
}
