import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";

export async function GET() {
  const session = await requireSession();

  const [students, applications, revenue, topAgents, totalStudents, pendingTasks, pendingRequests, recentStudents] = await Promise.all([
    prisma.student.groupBy({
      by: ["stage"],
      where: { tenantId: session.tenantId, isDeleted: false },
      _count: { stage: true },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { tenantId: session.tenantId },
      _count: { status: true },
    }),
    prisma.payment.aggregate({
      where: { tenantId: session.tenantId },
      _sum: { amount: true },
    }),
    prisma.student.groupBy({
      by: ["assignedAgentId"],
      where: { tenantId: session.tenantId, isDeleted: false, assignedAgentId: { not: null } },
      _count: { assignedAgentId: true },
      orderBy: { _count: { assignedAgentId: "desc" } },
      take: 5,
    }),
    prisma.student.count({ where: { tenantId: session.tenantId, isDeleted: false } }),
    prisma.task.count({ where: { tenantId: session.tenantId, status: { in: ["TODO", "IN_PROGRESS", "OVERDUE"] } } }),
    prisma.studentRequest.count({ where: { tenantId: session.tenantId, status: "PENDING" } }),
    prisma.student.findMany({
      where: { tenantId: session.tenantId, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, nationality: true, stage: true },
    }),
  ]);

  const agentIds = (topAgents as Array<{ assignedAgentId: string | null }>).map((item) => item.assignedAgentId).filter((id): id is string => Boolean(id));
  const agents: Array<{ id: string; name: string }> = agentIds.length
    ? await prisma.user.findMany({
        where: { tenantId: session.tenantId, id: { in: agentIds } },
        select: { id: true, name: true },
      })
    : [];

  return NextResponse.json({
    totalStudents,
    activeApplications: (applications as Array<{ _count: { status: number } }>).reduce((sum, item) => sum + item._count.status, 0),
    pendingTasks,
    newRequests: pendingRequests,
    funnel: (students as Array<{ stage: string; _count: { stage: number } }>).map((item) => ({ stage: item.stage, count: item._count.stage })),
    applicationStatus: (applications as Array<{ status: string; _count: { status: number } }>).map((item) => ({ status: item.status, count: item._count.status })),
    revenue: revenue._sum.amount ?? 0,
    recentStudents,
    topAgents: (topAgents as Array<{ assignedAgentId: string | null; _count: { assignedAgentId: number } }>).map((item) => ({
      agentId: item.assignedAgentId,
      studentCount: item._count.assignedAgentId,
      name: agents.find((agent) => agent.id === item.assignedAgentId)?.name ?? "Unassigned",
    })),
  });
}
