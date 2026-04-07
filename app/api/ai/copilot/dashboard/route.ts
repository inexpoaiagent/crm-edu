import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";

export async function GET() {
  const session = await requireSession();
  const [pendingTasks, pendingRequests, missingDocs, staleApps] = await Promise.all([
    prisma.task.count({
      where: { tenantId: session.tenantId, status: { in: ["TODO", "IN_PROGRESS", "OVERDUE"] } },
    }),
    prisma.studentRequest.count({ where: { tenantId: session.tenantId, status: "PENDING" } }),
    prisma.document.count({ where: { tenantId: session.tenantId, status: { in: ["MISSING", "UPLOADED"] } } }),
    prisma.application.count({
      where: {
        tenantId: session.tenantId,
        updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        status: { in: ["DRAFT", "SUBMITTED", "OFFERED"] },
      },
    }),
  ]);

  const recommendations = [
    pendingRequests > 0 ? `Review ${pendingRequests} pending portal request(s)` : "No pending portal requests",
    staleApps > 0 ? `Re-activate ${staleApps} stale application(s)` : "Applications are actively updated",
    missingDocs > 0 ? `Trigger document verification sprint for ${missingDocs} document(s)` : "Document pipeline is healthy",
    pendingTasks > 20 ? "Escalate workload: pending tasks exceed threshold" : "Task load is in a safe range",
  ];

  return NextResponse.json({
    headline: "AI Copilot Brief",
    summary: `Current workload: ${pendingTasks} pending tasks, ${pendingRequests} pending requests, ${missingDocs} docs needing attention, ${staleApps} stale applications.`,
    recommendations,
  });
}
