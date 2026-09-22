"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { validationFailed, type ActionResult } from "@/features/admin/action-result";
import { homeVideoSchema, type HomeVideoFormValues } from "@/features/admin/home-videos/schema";
import { HOME_VIDEO_SLOTS } from "@/features/home-videos/slots";
import type { HomeVideoSlot } from "@/lib/generated/prisma/enums";

export async function saveHomeVideo(
  slot: HomeVideoSlot,
  values: HomeVideoFormValues,
): Promise<ActionResult> {
  await requireAdmin();
  if (!HOME_VIDEO_SLOTS.some((known) => known.slot === slot)) {
    return { ok: false, error: "অজানা ভিডিও স্থান।" };
  }
  const parsed = homeVideoSchema.safeParse(values);
  if (!parsed.success) return validationFailed(parsed.error);

  await db.homeVideo.upsert({
    where: { slot },
    create: { slot, ...parsed.data },
    update: parsed.data,
  });
  revalidatePath("/");
  return { ok: true };
}
