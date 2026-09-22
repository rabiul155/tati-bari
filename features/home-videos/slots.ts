import type { HomeVideoSlot } from "@/lib/generated/prisma/enums";

export type HomeVideo = {
  slot: HomeVideoSlot;
  title: string | null;
  url: string;
  isVisible: boolean;
};

// The two home page video slots, in page order. `fallback` is shown until
// an admin saves the slot for the first time.
export const HOME_VIDEO_SLOTS: {
  slot: HomeVideoSlot;
  label: string;
  fallback: Omit<HomeVideo, "slot">;
}[] = [
  {
    slot: "AFTER_HERO",
    label: "ব্যানারের পরে",
    fallback: {
      title: "যেভাবে তৈরি হয় টাঙ্গাইল শাড়ি",
      url: "https://www.youtube.com/watch?v=KkhrR421eKc",
      isVisible: true,
    },
  },
  {
    slot: "BEFORE_FOOTER",
    label: "ফুটারের আগে",
    fallback: {
      title: "টাঙ্গাইলের তাঁতের ঐতিহ্য",
      url: "https://www.youtube.com/watch?v=0B-B9x5HzhI",
      isVisible: true,
    },
  },
];

const VIDEO_ID = /^[\w-]{11}$/;

// Accepts the links YouTube's share menus produce (watch, youtu.be, shorts,
// live, embed) or a bare video id. Returns null for anything else.
export function youTubeVideoId(input: string): string | null {
  const value = input.trim();
  if (VIDEO_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
  let id: string | null | undefined;
  if (host === "youtu.be") {
    id = url.pathname.split("/")[1];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, kind, pathId] = url.pathname.split("/");
    id = kind === "watch" ? url.searchParams.get("v") : ["shorts", "live", "embed"].includes(kind) ? pathId : null;
  }
  return id && VIDEO_ID.test(id) ? id : null;
}
