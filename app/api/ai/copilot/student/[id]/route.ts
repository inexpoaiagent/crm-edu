import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";
import { studentVisibilityWhere } from "@/lib/server/access";

export async function GET(_request: Request, context: RouteContext<"/api/ai/copilot/student/[id]">) {
  const session = await requireSession();
  const { id } = await context.params;

  const student = await prisma.student.findFirst({
    where: { ...studentVisibilityWhere(session), id },
    include: {
      applications: { include: { university: true }, orderBy: { updatedAt: "desc" } },
      documents: true,
      tasks: { orderBy: { updatedAt: "desc" }, take: 10 },
    },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const missingDocs = student.documents.filter((item) => item.status !== "VERIFIED");
  const overdueTasks = student.tasks.filter((item) => item.status === "OVERDUE");
  const latestApplication = student.applications[0];
  const riskAlerts: string[] = [];
  if (missingDocs.length) riskAlerts.push(`${missingDocs.length} document(s) still unverified`);
  if (overdueTasks.length) riskAlerts.push(`${overdueTasks.length} overdue task(s)`);
  if (latestApplication?.deadline && new Date(latestApplication.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000) {
    riskAlerts.push("Application deadline is within 7 days");
  }

  const nextActions = [
    missingDocs.length ? "Request missing documents from student" : "Review verified documents",
    latestApplication ? `Follow up with ${latestApplication.university.name} on ${latestApplication.program}` : "Create first application",
    overdueTasks.length ? "Resolve overdue tasks immediately" : "Schedule weekly progress check-in",
  ];

  const draftToStudent = `Hi ${student.fullName}, quick update: your current stage is ${student.stage}. ${missingDocs.length ? `Please upload/verify these: ${missingDocs.map((d) => d.type).slice(0, 3).join(", ")}.` : "Your documents look good."} Next step: ${nextActions[1]}.`;
  const draftToUniversity = latestApplication
    ? `Hello ${latestApplication.university.name} admissions team, following up on ${student.fullName}'s ${latestApplication.program} application (${latestApplication.status}). Please share the latest review status and any pending requirements.`
    : "No active university application to follow up.";

  const summary = `${student.fullName} (${student.nationality}) is currently in ${student.stage}. ${student.applications.length} application(s), ${student.documents.filter((d) => d.status === "VERIFIED").length}/${student.documents.length} verified documents, ${overdueTasks.length} overdue tasks.`;

  return NextResponse.json({
    summary,
    nextActions,
    draftMessages: {
      toStudent: draftToStudent,
      toUniversity: draftToUniversity,
    },
    riskAlerts,
  });
}
