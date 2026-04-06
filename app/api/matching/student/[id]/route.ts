import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";
import { studentVisibilityWhere } from "@/lib/server/access";

function tuitionScore(studentBudget?: number | null, tuitionRange?: string | null) {
  if (!studentBudget || !tuitionRange) return 0.5;
  const parsed = tuitionRange.match(/\d+/g);
  if (!parsed?.length) return 0.5;
  const maxTuition = Number(parsed[parsed.length - 1]);
  if (!maxTuition) return 0.5;
  return maxTuition <= studentBudget ? 1 : Math.max(0, 1 - (maxTuition - studentBudget) / Math.max(studentBudget, 1));
}

export async function GET(_request: Request, context: RouteContext<"/api/matching/student/[id]">) {
  const session = await requireSession();
  const { id } = await context.params;
  const student = await prisma.student.findFirst({
    where: { ...studentVisibilityWhere(session), id },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const universities = await prisma.university.findMany({
    where: { tenantId: session.tenantId },
    take: 100,
  });

  const recommendations = universities
    .map((university) => {
      let score = 0;
      const factors: string[] = [];

      const hasProgram = university.programs.some((program: string) =>
        program.toLowerCase().includes(student.fieldOfStudy.toLowerCase()),
      );
      if (hasProgram) {
        score += 0.4;
        factors.push("field");
      }

      const languageMatch = university.language.toLowerCase().includes(student.englishLevel.toLowerCase()) || student.englishLevel.toLowerCase().includes(university.language.toLowerCase());
      if (languageMatch) {
        score += 0.2;
        factors.push("language");
      }

      if ((student.gpa ?? 0) >= 2.5) {
        score += 0.2;
        factors.push("gpa");
      }

      const budgetScore = tuitionScore(student.budget, university.tuitionRange);
      score += budgetScore * 0.2;
      if (budgetScore >= 0.8) factors.push("budget");

      return {
        universityId: university.id,
        universityName: university.name,
        country: university.country,
        score: Number(score.toFixed(2)),
        factors,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return NextResponse.json({ studentId: student.id, recommendations });
}
