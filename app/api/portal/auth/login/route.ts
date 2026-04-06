import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/server/password";
import { setSessionCookie } from "@/lib/server/session";

const portalLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantSlug: z.string().min(2),
});

export async function POST(request: Request) {
  const parsed = portalLoginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { email, password, tenantSlug } = parsed.data;
  const tenant = await prisma.tenant.findFirst({ where: { slug: tenantSlug, isActive: true } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const student = await prisma.student.findFirst({
    where: { tenantId: tenant.id, email: email.toLowerCase(), isDeleted: false },
  });

  if (!student?.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isMatch = await comparePassword(password, student.passwordHash);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setSessionCookie({
    userId: student.id,
    tenantId: tenant.id,
    role: "Student",
    authType: "STUDENT",
  });

  return NextResponse.json({
    student: { id: student.id, fullName: student.fullName, email: student.email, tenantSlug: tenant.slug },
  });
}
