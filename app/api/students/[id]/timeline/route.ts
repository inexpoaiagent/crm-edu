import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";
import { studentVisibilityWhere } from "@/lib/server/access";

export async function GET(_request: Request, context: RouteContext<"/api/students/[id]/timeline">) {
  const session = await requireSession();
  const { id } = await context.params;

  const student = await prisma.student.findFirst({ where: { ...studentVisibilityWhere(session), id }, select: { id: true } });
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [auditLogs, tasks, applications, documents] = await Promise.all([
    prisma.auditLog.findMany({
      where: { tenantId: session.tenantId, OR: [{ resourceId: id }, { description: { contains: id } }] },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: { id: true, description: true, createdAt: true, category: true },
    }),
    prisma.task.findMany({
      where: { tenantId: session.tenantId, relatedStudentId: id },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, title: true, updatedAt: true, status: true },
    }),
    prisma.application.findMany({
      where: { tenantId: session.tenantId, studentId: id },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, status: true, program: true, updatedAt: true },
    }),
    prisma.document.findMany({
      where: { tenantId: session.tenantId, studentId: id },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, type: true, status: true, updatedAt: true },
    }),
  ]);

  const events = [
    ...auditLogs.map((item) => ({
      id: `audit-${item.id}`,
      type: "AUDIT",
      title: item.description,
      at: item.createdAt,
      meta: { category: item.category ?? "SYSTEM" },
    })),
    ...tasks.map((item) => ({
      id: `task-${item.id}`,
      type: "TASK",
      title: `${item.title} (${item.status})`,
      at: item.updatedAt,
      meta: { status: item.status },
    })),
    ...applications.map((item) => ({
      id: `app-${item.id}`,
      type: "APPLICATION",
      title: `${item.program} -> ${item.status}`,
      at: item.updatedAt,
      meta: { status: item.status },
    })),
    ...documents.map((item) => ({
      id: `doc-${item.id}`,
      type: "DOCUMENT",
      title: `${item.type} -> ${item.status}`,
      at: item.updatedAt,
      meta: { status: item.status },
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 60);

  return NextResponse.json({ auditLogs, tasks, applications, documents, events });
}
