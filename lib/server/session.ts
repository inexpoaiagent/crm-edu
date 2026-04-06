import { cookies } from "next/headers";
import type { SessionPayload } from "./jwt";
import { signSession, verifySession } from "./jwt";

const COOKIE_NAME = "crm_session";

export function setSessionCookie(payload: SessionPayload) {
  cookies().set({
    name: COOKIE_NAME,
    value: signSession(payload),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME, { path: "/" });
}

export function getSessionFromCookie() {
  const cookie = cookies().get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifySession(cookie.value);
}
