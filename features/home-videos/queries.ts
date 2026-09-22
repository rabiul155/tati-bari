import "server-only";
import { db } from "@/lib/db";
import { HOME_VIDEO_SLOTS, type HomeVideo } from "@/features/home-videos/slots";

// Every slot, in page order, with the saved row or its default.
export async function getHomeVideos(): Promise<HomeVideo[]> {
  const rows = await db.homeVideo.findMany({
    select: { slot: true, title: true, url: true, isVisible: true },
  });
  return HOME_VIDEO_SLOTS.map(
    ({ slot, fallback }) => rows.find((row) => row.slot === slot) ?? { slot, ...fallback },
  );
}
