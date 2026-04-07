import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";

const saveViewSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  filters: z.record(z.string(), z.unknown()),
  shared: z.boolean().optional(),
});

type SavedView = {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  shared: boolean;
  updatedAt: string;
};

export async function GET() {
  const session = await requireSession();
  const user = await prisma.user.findFirst({
    where: { id: session.userId, tenantId: session.tenantId, isDeleted: false },
    select: { profile: true },
  });
  const profile = (user?.profile as { savedViews?: Array<unknown> } | null) ?? null;
  return NextResponse.json({ views: profile?.savedViews ?? [] });
}

export async function POST(request: Request) {
  const session = await requireSession();
  const parsed = saveViewSchema.safeParse(await request.json());
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

  const current = (user.profile as { savedViews?: SavedView[] } | null) ?? {};
  const savedViews = [...(current.savedViews ?? [])];
  const id = parsed.data.id ?? crypto.randomUUID();
  const nextView = {
    id,
    name: parsed.data.name,
    filters: parsed.data.filters,
    shared: parsed.data.shared ?? false,
    updatedAt: new Date().toISOString(),
  };
  const existingIndex = savedViews.findIndex((item) => item.id === id);
  if (existingIndex >= 0) {
    savedViews[existingIndex] = nextView;
  } else {
    savedViews.unshift(nextView);
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { profile: JSON.parse(JSON.stringify({ ...(current as object), savedViews })) },
  });

  return NextResponse.json({ view: nextView });
}

export async function DELETE(request: Request) {
  const session = await requireSession();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { id: session.userId, tenantId: session.tenantId, isDeleted: false },
    select: { profile: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const current = (user.profile as { savedViews?: SavedView[] } | null) ?? {};
  const savedViews = (current.savedViews ?? []).filter((item) => item.id !== id);

  await prisma.user.update({
    where: { id: session.userId },
    data: { profile: JSON.parse(JSON.stringify({ ...(current as object), savedViews })) },
  });

  return NextResponse.json({ message: "Deleted" });
}
