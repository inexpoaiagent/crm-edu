import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/server/password";
import { setSessionCookie } from "@/lib/server/session";

export async function POST(request: Request) {
  const data = await request.json();
  const { email, password, tenantSlug } = data;

  if (!email || !password || !tenantSlug) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), tenantId: tenant.id, isDeleted: false },
    include: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const matched = await comparePassword(password, user.passwordHash);
  if (!matched) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const payload = { userId: user.id, tenantId: tenant.id, role: user.role.name };
  setSessionCookie(payload);

  return NextResponse.json({ message: "Authenticated" });
}
