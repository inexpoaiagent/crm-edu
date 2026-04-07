import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";

const orderSchema = z.object({
  boardOrder: z.record(z.string(), z.array(z.string())),
});

export async function GET() {
  const session = await requireSession();
  const user = await prisma.user.findFirst({
    where: { id: session.userId, tenantId: session.tenantId, isDeleted: false },
    select: { profile: true },
  });
  const profile = (user?.profile as { boardOrder?: Record<string, string[]> } | null) ?? null;
  return NextResponse.json({ boardOrder: profile?.boardOrder ?? {} });
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { id: session.userId, tenantId: session.tenantId, isDeleted: false },
    select: { profile: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const current = (user.profile as Record<string, unknown> | null) ?? {};
  await prisma.user.update({
    where: { id: session.userId },
    data: { profile: { ...current, boardOrder: parsed.data.boardOrder } },
  });
  return NextResponse.json({ message: "Saved" });
}
