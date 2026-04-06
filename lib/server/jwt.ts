import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "unsafe-dev-secret-change-me";
const TOKEN_EXPIRY = "7d";
const JWT_ISSUER = "vertue-crm";

export type SessionPayload = {
  userId: string;
  tenantId: string;
  role: string;
  authType: "USER" | "STUDENT";
};

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY, issuer: JWT_ISSUER });
}

export function verifySession(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER }) as SessionPayload;
  } catch {
    return null;
  }
}
