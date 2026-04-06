import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { requireSession, enforceRole } from "@/lib/server/guards";
import { studentVisibilityWhere } from "@/lib/server/access";

const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await requireSession();
  enforceRole(session, ["SuperAdmin", "Admin", "Agent", "SubAgent"]);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const studentId = formData.get("studentId")?.toString();
  const type = formData.get("type")?.toString();

  if (!file || !studentId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const allowedTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }
  if (!["PASSPORT", "DIPLOMA", "TRANSCRIPT", "ENGLISH_CERTIFICATE", "PHOTO"].includes(type)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  const student = await prisma.student.findFirst({
    where: { id: studentId, ...studentVisibilityWhere(session) },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found or access denied" }, { status: 404 });
  }

  await fs.promises.mkdir(uploadDir, { recursive: true });
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);
  const arrayBuffer = await file.arrayBuffer();
  await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));

  const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/uploads/documents/${fileName}`;

  const document = await prisma.document.create({
    data: {
      tenantId: session.tenantId,
      studentId,
      type: type as "PASSPORT" | "DIPLOMA" | "TRANSCRIPT" | "ENGLISH_CERTIFICATE" | "PHOTO",
      fileName: file.name,
      fileUrl,
      status: "UPLOADED",
      uploadedById: session.userId,
    },
  });

  return NextResponse.json({ document });
}
