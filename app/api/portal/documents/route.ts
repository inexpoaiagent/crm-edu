import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { requireStudentSession } from "@/lib/server/guards";

const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
const allowedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);

export const runtime = "nodejs";

export async function GET() {
  const session = await requireStudentSession();
  const documents = await prisma.document.findMany({
    where: { tenantId: session.tenantId, studentId: session.student.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const session = await requireStudentSession();
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type")?.toString();
  const expiryDate = formData.get("expiryDate")?.toString();

  if (!file || !type) {
    return NextResponse.json({ error: "Missing file or document type" }, { status: 400 });
  }
  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Max file size is 10MB" }, { status: 400 });
  }
  if (!["PASSPORT", "DIPLOMA", "TRANSCRIPT", "ENGLISH_CERTIFICATE", "PHOTO"].includes(type)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
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
      studentId: session.student.id,
      type: type as "PASSPORT" | "DIPLOMA" | "TRANSCRIPT" | "ENGLISH_CERTIFICATE" | "PHOTO",
      fileName: file.name,
      fileUrl,
      status: "UPLOADED",
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
  });

  return NextResponse.json({ document });
}
