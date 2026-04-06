import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";

export async function GET() {
  const session = await requireSession();
  const user = await prisma.user.findFirst({
    where: { id: session.userId, tenantId: session.tenantId, isDeleted: false },
    include: { role: true, notifications: { take: 5, orderBy: { createdAt: "desc" } } },
  });

  if (!user) {
    return NextResponse.json({ error: "Session invalid" }, { status: 401 });
  }
  const notifications = user.notifications as Array<{ read: boolean }>;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      language: user.language,
      tenantId: user.tenantId,
      unreadNotifications: notifications.filter((notification) => !notification.read).length,
    },
  });
}
