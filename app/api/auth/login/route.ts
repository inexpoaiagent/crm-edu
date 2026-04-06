import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/server/password";
import { setSessionCookie } from "@/lib/server/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantSlug: z.string().min(2),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }
  const { email, password, tenantSlug } = parsed.data;

  const tenant = await prisma.tenant.findFirst({ where: { slug: tenantSlug, isActive: true } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), tenantId: tenant.id, isDeleted: false, status: "ACTIVE" },
    include: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const matched = await comparePassword(password, user.passwordHash);
  if (!matched) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  await setSessionCookie({
    userId: user.id,
    tenantId: tenant.id,
    role: user.role.name,
    authType: "USER",
  });

  return NextResponse.json({
    message: "Authenticated",
    user: { id: user.id, name: user.name, role: user.role.name, tenantSlug: tenant.slug },
  });
}
