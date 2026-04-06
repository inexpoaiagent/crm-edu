import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";
import { hashPassword } from "@/lib/server/password";

const stageEnum = z.enum(["LEAD", "ENROLLED", "APPLIED", "OFFERED"]);

const createStudentSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(6),
  nationality: z.string(),
  fieldOfStudy: z.string(),
  englishLevel: z.string(),
  stage: stageEnum.optional(),
  gpa: z.number().min(0).max(4).optional(),
  assignedAgentId: z.string().optional(),
  assignedSubAgentId: z.string().optional(),
  username: z.string().min(3),
  password: z.string().min(6).optional(),
});

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent"]);
  const payload = await request.json();
  const parsed = createStudentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { password, ...rest } = parsed.data;
  const passwordHash = password ? await hashPassword(password) : undefined;

  try {
    const student = await prisma.student.create({
      data: {
        tenantId: session.tenantId,
        ...rest,
        email: rest.email.toLowerCase(),
        username: rest.username.toLowerCase(),
        passwordHash,
        assignedAgentId: rest.assignedAgentId || undefined,
        assignedSubAgentId: rest.assignedSubAgentId || undefined,
      },
    });
    return NextResponse.json({ student });
  } catch (error) {
    console.error("student create failed", error);
    return NextResponse.json({ error: "Unable to create student" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await requireSession();
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);
  const stage = searchParams.get("stage");
  const assignedAgentId = searchParams.get("assignedAgentId");

  const where: Prisma.StudentWhereInput = { tenantId: session.tenantId, isDeleted: false };
  if (stage) {
    const parsedStage = stageEnum.safeParse(stage);
    if (parsedStage.success) {
      where.stage = parsedStage.data;
    }
  }
  if (assignedAgentId) where.assignedAgentId = assignedAgentId;
  const search = searchParams.get("search");
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ];
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  return NextResponse.json({ students, meta: { currentPage: page, total, limit } });
}
