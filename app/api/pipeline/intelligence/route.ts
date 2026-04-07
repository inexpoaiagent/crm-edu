import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";
import { studentVisibilityWhere } from "@/lib/server/access";

function scoreStudent(input: {
  gpa?: number | null;
  stage: string;
  verifiedDocs: number;
  totalDocs: number;
  hasOverdueTask: boolean;
  activeApplications: number;
}) {
  let score = 0.2;
  const reasons: string[] = [];

  if ((input.gpa ?? 0) >= 3.2) {
    score += 0.22;
    reasons.push("Strong GPA");
  } else if ((input.gpa ?? 0) >= 2.6) {
    score += 0.12;
    reasons.push("Acceptable GPA");
  } else {
    reasons.push("Low GPA");
  }

  if (input.stage === "ENROLLED") {
    score = 0.98;
    reasons.push("Already enrolled");
  } else if (input.stage === "OFFERED") {
    score += 0.25;
    reasons.push("Has offer");
  } else if (input.stage === "APPLIED") {
    score += 0.16;
    reasons.push("Application submitted");
  } else {
    reasons.push("Still in lead stage");
  }

  const docCompletion = input.totalDocs ? input.verifiedDocs / input.totalDocs : 0;
  score += docCompletion * 0.2;
  if (docCompletion >= 0.6) reasons.push("Documents mostly verified");
  else reasons.push("Documents incomplete");

  if (input.hasOverdueTask) {
    score -= 0.1;
    reasons.push("Overdue task exists");
  }
  if (input.activeApplications > 1) {
    score += 0.05;
    reasons.push("Multiple active applications");
  }

  const normalized = Math.max(0.05, Math.min(0.98, score));
  const bestNextAction =
    docCompletion < 0.6
      ? "Follow up on missing documents"
      : input.stage === "LEAD"
        ? "Submit first application"
        : input.stage === "APPLIED"
          ? "Prepare interview and scholarship options"
          : input.stage === "OFFERED"
            ? "Collect deposit and visa documents"
            : "Track onboarding progress";

  return { probability: Number((normalized * 100).toFixed(1)), reasons, bestNextAction };
}

export async function GET() {
  const session = await requireSession();
  const where = studentVisibilityWhere(session);

  const students = await prisma.student.findMany({
    where,
    include: {
      applications: { select: { id: true, status: true } },
      documents: { select: { id: true, status: true } },
      tasks: { select: { id: true, status: true } },
    },
    take: 120,
    orderBy: { updatedAt: "desc" },
  });

  const intelligence = students.map((student) => {
    const verifiedDocs = student.documents.filter((doc) => doc.status === "VERIFIED").length;
    const activeApplications = student.applications.filter((app) => app.status !== "REJECTED").length;
    const hasOverdueTask = student.tasks.some((task) => task.status === "OVERDUE");
    const scored = scoreStudent({
      gpa: student.gpa,
      stage: student.stage,
      verifiedDocs,
      totalDocs: student.documents.length,
      hasOverdueTask,
      activeApplications,
    });

    return {
      studentId: student.id,
      fullName: student.fullName,
      stage: student.stage,
      probability: scored.probability,
      reasons: scored.reasons,
      bestNextAction: scored.bestNextAction,
    };
  });

  const sorted = intelligence.sort((a, b) => b.probability - a.probability);
  return NextResponse.json({ predictions: sorted });
}
