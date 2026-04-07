import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";
import { studentVisibilityWhere } from "@/lib/server/access";

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase().trim();
}

function tokenize(value: string) {
  return normalize(value)
    .split(/[\s,/.-]+/)
    .filter(Boolean);
}

function tuitionScore(studentBudget?: number | null, tuitionRange?: string | null) {
  if (!studentBudget || !tuitionRange) return 0.55;
  const parsed = tuitionRange.match(/\d+/g);
  if (!parsed?.length) return 0.55;
  const maxTuition = Number(parsed[parsed.length - 1]);
  if (!maxTuition) return 0.55;
  if (maxTuition <= studentBudget) return 1;
  return Math.max(0, 1 - (maxTuition - studentBudget) / Math.max(studentBudget, 1));
}

function languageCompatibility(englishLevel: string, universityLanguage: string) {
  const level = normalize(englishLevel);
  const uniLang = normalize(universityLanguage);
  const englishLike = ["english", "ielts", "toefl", "b2", "c1", "c2", "advanced"];
  const isEnglishReady = englishLike.some((item) => level.includes(item));
  if (isEnglishReady && uniLang.includes("english")) return 1;
  if (!isEnglishReady && uniLang.includes("turkish")) return 0.7;
  if (uniLang.includes("english") || uniLang.includes("turkish")) return 0.6;
  return 0.45;
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
    take: 300,
  });
  if (!universities.length) {
    return NextResponse.json({ studentId: student.id, recommendations: [] });
  }

  const fieldTokens = tokenize(student.fieldOfStudy);
  const recommendations = universities
    .map((university) => {
      let score = 0;
      const factors: string[] = [];
      const universityPrograms = Array.from(new Set(university.programs || []));
      const programTokens = universityPrograms.flatMap((program) => tokenize(program));
      const overlap = fieldTokens.filter((token) => programTokens.includes(token)).length;
      const programScore = Math.min(1, overlap / Math.max(fieldTokens.length, 1));

      if (programScore > 0.15) {
        score += programScore * 0.4;
        factors.push("field-fit");
      } else if (!fieldTokens.length) {
        score += 0.2;
        factors.push("general-fit");
      }

      const langScore = languageCompatibility(student.englishLevel, university.language);
      score += langScore * 0.2;
      if (langScore >= 0.75) factors.push("language");

      const gpaScore = student.gpa ? Math.min(1, student.gpa / 4) : 0.6;
      score += gpaScore * 0.2;
      if (gpaScore >= 0.7) factors.push("gpa");

      const budgetScore = tuitionScore(student.budget, university.tuitionRange);
      score += budgetScore * 0.2;
      if (budgetScore >= 0.75) factors.push("budget");

      const recommendedProgram =
        universityPrograms.find((program) => tokenize(program).some((token) => fieldTokens.includes(token))) ??
        universityPrograms[0] ??
        "General";

      return {
        universityId: university.id,
        universityName: university.name,
        country: university.country,
        recommendedProgram,
        score: Number(Math.min(1, score).toFixed(2)),
        factors,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);

  return NextResponse.json({ studentId: student.id, recommendations });
}
