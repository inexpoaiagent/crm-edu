import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const paymentSchema = z.object({
  studentId: z.string(),
  type: z.enum(["Tuition", "Service Fee", "Commission"]),
  amount: z.number().positive(),
  currency: z.string().max(3),
  description: z.string().optional(),
  commission: z.number().nonnegative().optional(),
});

export async function GET() {
  const session = await requireSession();
  const payments = await prisma.payment.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = paymentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      tenantId: session.tenantId,
      ...parsed.data,
    },
  });

  return NextResponse.json({ payment });
}
