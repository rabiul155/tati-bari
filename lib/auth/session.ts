// Admin session: cookie handling plus the checks every admin page, server
// action and route handler must run (via requireAdmin). proxy.ts only does
// a quick signature check; this is the real one, against the database.
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
} from "@/lib/auth/session-token";

export type AdminSession = {
  id: string;
  name: string;
  email: string;
};

export async function createSession(admin: { id: string; sessionVersion: number }) {
  const token = signSessionToken(
    {
      sub: admin.id,
      ver: admin.sessionVersion,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    },
    env.SESSION_SECRET,
  );
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    // Only sent to admin pages, never to the storefront.
    path: "/admin",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
}

// The signed-in admin, or null. Memoized per request.
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = verifySessionToken(token, env.SESSION_SECRET);
  if (!payload) return null;

  const admin = await db.adminUser.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, isActive: true, sessionVersion: true },
  });
  if (!admin?.isActive || admin.sessionVersion !== payload.ver) return null;

  return { id: admin.id, name: admin.name, email: admin.email };
});

// Call at the top of every admin page, server action and route handler.
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return admin;
}
