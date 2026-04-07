import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/server/guards";

function inferDocumentType(fileName: string, currentType: string) {
  const lower = fileName.toLowerCase();
  if (lower.includes("passport")) return "PASSPORT";
  if (lower.includes("diploma")) return "DIPLOMA";
  if (lower.includes("transcript")) return "TRANSCRIPT";
  if (lower.includes("english") || lower.includes("ielts") || lower.includes("toefl")) return "ENGLISH_CERTIFICATE";
  if (lower.includes("photo")) return "PHOTO";
  return currentType;
}

export async function POST(_request: Request, context: RouteContext<"/api/documents/[id]/analyze">) {
  const session = await requireSession();
  const { id } = await context.params;

  const document = await prisma.document.findFirst({
    where: { id, tenantId: session.tenantId },
    include: { student: true },
  });
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const inferredType = inferDocumentType(document.fileName, document.type);
  const now = Date.now();
  const expiryTime = document.expiryDate ? new Date(document.expiryDate).getTime() : null;
  const validations = {
    typeConsistency: inferredType === document.type,
    isExpired: expiryTime ? expiryTime < now : false,
    expiresSoon: expiryTime ? expiryTime - now < 30 * 24 * 60 * 60 * 1000 : false,
    statusNeedsReview: document.status !== "VERIFIED",
  };

  const extracted = {
    studentNameHint: document.student.fullName,
    documentTypeHint: inferredType,
    fileExtension: document.fileName.split(".").pop()?.toLowerCase() ?? "unknown",
  };

  const recommendations: string[] = [];
  if (!validations.typeConsistency) recommendations.push("Possible document type mismatch.");
  if (validations.isExpired) recommendations.push("Document appears expired; request renewal.");
  else if (validations.expiresSoon) recommendations.push("Document expires within 30 days.");
  if (validations.statusNeedsReview) recommendations.push("Queue for manual verification.");
  if (!recommendations.length) recommendations.push("No critical issue detected.");

  return NextResponse.json({
    documentId: document.id,
    extracted,
    validations,
    recommendations,
  });
}
