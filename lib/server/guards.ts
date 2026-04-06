import { NextResponse } from "next/server";
import { getSessionFromCookie } from "./session";
import prisma from "../prisma";

export async function requireSession() {
  const payload = getSessionFromCookie();
  if (!payload) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { role: true },
  });

  if (!user || user.isDeleted || user.status !== "ACTIVE") {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { ...payload, user };
}

export function enforceRole(session: Awaited<ReturnType<typeof requireSession>>, allowed: string[]) {
  if (!allowed.includes(session.user.role.name)) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session;
}
