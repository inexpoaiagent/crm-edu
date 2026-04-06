import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";

const updateSchema = z.object({
  status: z.enum(["MISSING", "UPLOADED", "VERIFIED"]).optional(),
  expiryDate: z.string().optional(),
  fileName: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const document = await prisma.document.findFirst({ where: { id: params.id, tenantId: session.tenantId } });
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ document });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const document = await prisma.document.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
    },
  });

  return NextResponse.json({ document });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin"]);
  await prisma.document.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Document deleted" });
}
