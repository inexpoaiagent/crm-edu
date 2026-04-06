import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";
import { hashPassword } from "@/lib/server/password";
import { sendNotification } from "@/lib/server/activity";

const requestSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(6),
  intake: z.string().optional(),
  notes: z.string().optional(),
});

const reviewSchema = z.object({
  requestId: z.string(),
  action: z.enum(["APPROVE", "REJECT"]),
  message: z.string().optional(),
  assignedAgentId: z.string().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  universityId: z.string().optional(),
  program: z.string().optional(),
  intake: z.string().optional(),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const { tenantSlug, ...rest } = payload;
  const parsed = requestSchema.safeParse(rest);
  if (!parsed.success || !tenantSlug) {
    return NextResponse.json({ error: parsed.error?.issues ?? "Invalid payload" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const studentRequest = await prisma.studentRequest.create({
    data: {
      tenantId: tenant.id,
      ...parsed.data,
    },
  });

  return NextResponse.json({ studentRequest });
}

export async function GET() {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const requests = await prisma.studentRequest.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ requests });
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const requestRecord = await prisma.studentRequest.findFirst({
    where: { id: parsed.data.requestId, tenantId: session.tenantId },
  });
  if (!requestRecord) {
    return NextResponse.json({ error: "Student request not found" }, { status: 404 });
  }
  if (requestRecord.status !== "PENDING") {
    return NextResponse.json({ error: "Request already processed" }, { status: 409 });
  }

  if (parsed.data.action === "REJECT") {
    const updated = await prisma.studentRequest.update({
      where: { id: requestRecord.id },
      data: { status: "REJECTED", notes: parsed.data.message ?? requestRecord.notes },
    });
    return NextResponse.json({ request: updated });
  }

  if (!parsed.data.username || !parsed.data.password) {
    return NextResponse.json({ error: "Username and password required for approval" }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const student = await prisma.student.create({
    data: {
      tenantId: session.tenantId,
      fullName: requestRecord.fullName,
      email: requestRecord.email.toLowerCase(),
      phone: requestRecord.phone,
      nationality: "Unknown",
      fieldOfStudy: parsed.data.program ?? "Undeclared",
      englishLevel: "Unknown",
      stage: "LEAD",
      username: parsed.data.username.toLowerCase(),
      passwordHash,
      assignedAgentId: parsed.data.assignedAgentId,
    },
  });

  let createdApplication = null;
  if (parsed.data.universityId && parsed.data.program && parsed.data.intake) {
    createdApplication = await prisma.application.create({
      data: {
        tenantId: session.tenantId,
        studentId: student.id,
        universityId: parsed.data.universityId,
        program: parsed.data.program,
        intake: parsed.data.intake,
        status: "DRAFT",
        createdById: session.userId,
      },
    });
  }

  await prisma.studentRequest.update({
    where: { id: requestRecord.id },
    data: { status: "APPROVED" },
  });

  if (student.assignedAgentId) {
    await sendNotification({
      tenantId: session.tenantId,
      userId: student.assignedAgentId,
      title: "Student request approved",
      message: `${student.fullName} is now assigned to you.`,
      type: "new_student",
    });
  }

  return NextResponse.json({ student, application: createdApplication });
}
