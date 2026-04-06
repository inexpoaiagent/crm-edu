import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enforceRole, requireSession } from "@/lib/server/guards";

export async function GET() {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin"]);

  const logs = await prisma.auditLog.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ logs });
}
