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

export async function PATCH(request: Request, context: RouteContext<"/api/payments/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const { id } = await context.params;
  const existing = await prisma.payment.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const payment = await prisma.payment.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ payment });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/payments/[id]">) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const { id } = await context.params;
  const existing = await prisma.payment.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.payment.delete({ where: { id } });
  return NextResponse.json({ message: "Payment removed" });
}
