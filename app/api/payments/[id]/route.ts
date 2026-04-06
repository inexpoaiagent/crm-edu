import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const updateSchema = z.object({
  type: z.enum(["Tuition", "Service Fee", "Commission"]).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().max(3).optional(),
  description: z.string().optional(),
  commission: z.number().nonnegative().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const payment = await prisma.payment.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ payment });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  await prisma.payment.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Payment removed" });
}
