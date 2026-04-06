import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "unsafe-secret";
const TOKEN_EXPIRY = "7d";

export type SessionPayload = {
  userId: string;
  tenantId: string;
  role: string;
};

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifySession(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}
