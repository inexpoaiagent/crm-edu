import type { AuthSession } from "./guards";

export function studentVisibilityWhere(session: AuthSession) {
  const role = session.user.role.name;

  if (role === "Agent") {
    return {
      tenantId: session.tenantId,
      isDeleted: false,
      OR: [{ assignedAgentId: session.userId }, { assignedSubAgentId: session.userId }],
    };
  }

  if (role === "SubAgent") {
    return { tenantId: session.tenantId, isDeleted: false, assignedSubAgentId: session.userId };
  }

  return { tenantId: session.tenantId, isDeleted: false };
}

export function applicationVisibilityWhere(session: AuthSession) {
  const role = session.user.role.name;

  if (role === "Agent") {
    return {
      tenantId: session.tenantId,
      OR: [{ createdById: session.userId }, { student: { assignedAgentId: session.userId } }, { assignedSubAgentId: session.userId }],
    };
  }

  if (role === "SubAgent") {
    return {
      tenantId: session.tenantId,
      OR: [{ assignedSubAgentId: session.userId }, { student: { assignedSubAgentId: session.userId } }],
    };
  }

  return { tenantId: session.tenantId };
}
