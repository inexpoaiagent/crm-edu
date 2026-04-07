import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";
import { comparePassword, hashPassword } from "@/lib/server/password";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  language: z.enum(["en", "tr", "fa"]).optional(),
  fontScale: z.enum(["sm", "md", "lg"]).optional(),
  preferredCurrency: z.enum(["TRY", "USD", "EUR", "GBP"]).optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
});

function readUiPreferences(profile: unknown) {
  const raw = (profile && typeof profile === "object" ? profile : {}) as Record<string, unknown>;
  const fontScale = raw.fontScale === "sm" || raw.fontScale === "lg" ? raw.fontScale : "md";
  const preferredCurrency =
    raw.preferredCurrency === "USD" || raw.preferredCurrency === "EUR" || raw.preferredCurrency === "GBP" ? raw.preferredCurrency : "TRY";
  return { fontScale, preferredCurrency };
}

export async function GET() {
  const session = await requireSession();
  const user = await prisma.user.findFirst({
    where: { id: session.userId, tenantId: session.tenantId, isDeleted: false },
    select: { id: true, name: true, email: true, language: true, profile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      ...readUiPreferences(user.profile),
    },
  });
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { id: session.userId, tenantId: session.tenantId, isDeleted: false },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let passwordHash: string | undefined;
  if (parsed.data.newPassword) {
    if (!parsed.data.currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }
    const validCurrent = await comparePassword(parsed.data.currentPassword, user.passwordHash);
    if (!validCurrent) {
      return NextResponse.json({ error: "Current password is invalid" }, { status: 400 });
    }
    passwordHash = await hashPassword(parsed.data.newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      language: parsed.data.language,
      profile: {
        ...(user.profile && typeof user.profile === "object" ? (user.profile as Record<string, unknown>) : {}),
        ...(parsed.data.fontScale ? { fontScale: parsed.data.fontScale } : {}),
        ...(parsed.data.preferredCurrency ? { preferredCurrency: parsed.data.preferredCurrency } : {}),
      },
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: { id: true, name: true, email: true, language: true, profile: true },
  });

  return NextResponse.json({
    profile: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      language: updated.language,
      ...readUiPreferences(updated.profile),
    },
  });
}
