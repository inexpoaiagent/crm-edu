import { NextResponse } from "next/server";
import prisma from "../prisma";
import { getSessionFromCookie } from "./session";

type SessionWithUser = {
  userId: string;
  tenantId: string;
  role: string;
  authType: "USER";
  user: {
    id: string;
    tenantId: string;
    isDeleted: boolean;
    status: string;
    role: { name: string; permissions: string[] };
    language: string;
    email: string;
    name: string;
  };
};

export type AuthSession = Awaited<ReturnType<typeof requireSession>>;

function forbidden(message = "Forbidden", status = 403): never {
  throw NextResponse.json({ error: message }, { status });
}

export async function requireSession(): Promise<SessionWithUser> {
  const payload = await getSessionFromCookie();
  if (!payload || payload.authType !== "USER") {
    forbidden("Unauthorized", 401);
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, tenantId: payload.tenantId },
    include: { role: true },
  });

  if (!user || user.isDeleted || user.status !== "ACTIVE") {
    forbidden("Unauthorized", 401);
  }

  return { ...payload, authType: "USER", user };
}

export async function requireStudentSession() {
  const payload = await getSessionFromCookie();
  if (!payload || payload.authType !== "STUDENT") {
    forbidden("Unauthorized", 401);
  }

  const student = await prisma.student.findFirst({
    where: { id: payload.userId, tenantId: payload.tenantId, isDeleted: false },
  });

  if (!student || !student.passwordHash) {
    forbidden("Unauthorized", 401);
  }

  return { ...payload, authType: "STUDENT" as const, student };
}

export function enforceRole(session: AuthSession, allowed: string[]) {
  if (!allowed.includes(session.user.role.name)) {
    forbidden();
  }

  return session;
}

export function hasPermission(session: AuthSession, required: string) {
  const permissions = session.user.role.permissions ?? [];
  if (permissions.includes("*")) return true;
  if (permissions.includes(required)) return true;

  const [resource] = required.split(":");
  return permissions.includes(`${resource}:*`);
}

export function enforcePermission(session: AuthSession, required: string) {
  if (!hasPermission(session, required)) {
    forbidden();
  }
}
