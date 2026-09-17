"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getDummyPasswordHash, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, getAdminSession } from "@/lib/auth/session";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(200),
});

export type LoginState = { error: string; email: string } | undefined;

const INVALID = "Incorrect email or password.";

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: INVALID, email };

  const admin = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (!admin || !admin.isActive) {
    await verifyPassword(parsed.data.password, await getDummyPasswordHash());
    return { error: INVALID, email };
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    return {
      error: `Too many failed attempts. Try again after ${admin.lockedUntil.toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit" })}.`,
      email,
    };
  }

  if (!(await verifyPassword(parsed.data.password, admin.passwordHash))) {
    const { failedLoginAttempts } = await db.adminUser.update({
      where: { id: admin.id },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });
    if (failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      await db.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000),
        },
      });
    }
    return { error: INVALID, email };
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await createSession(admin);
  redirect("/admin");
}

// Signs out everywhere: bumping the session version invalidates every
// cookie issued so far, including any copied from this browser.
export async function logout() {
  const admin = await getAdminSession();
  if (admin) {
    await db.adminUser.update({
      where: { id: admin.id },
      data: { sessionVersion: { increment: 1 } },
    });
  }
  await deleteSession();
  redirect("/admin/login");
}
