import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const notificationSchema = z.object({
  title: z.string().min(3),
  message: z.string().min(5),
  userId: z.string(),
  type: z.string().optional(),
});

export async function GET() {
  const session = await requireSession();
  const notifications = await prisma.notification.findMany({
    where: { tenantId: session.tenantId, userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ notifications });
}

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = notificationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: {
      tenantId: session.tenantId,
      ...parsed.data,
    },
  });

  return NextResponse.json({ notification });
}
