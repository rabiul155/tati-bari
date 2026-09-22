import { z } from "zod";
import { youTubeVideoId } from "@/features/home-videos/slots";

// Form values are strings (boolean for the checkbox). Any accepted YouTube
// link is stored in one canonical form.
export const homeVideoSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120)
    .transform((value) => value || null),
  url: z
    .string()
    .trim()
    .min(1, "একটি ইউটিউব লিংক দিন।")
    .refine((value) => youTubeVideoId(value) !== null, "এটি সঠিক ইউটিউব ভিডিও লিংক নয়।")
    .transform((value) => `https://www.youtube.com/watch?v=${youTubeVideoId(value)}`),
  isVisible: z.boolean(),
});

export type HomeVideoFormValues = z.input<typeof homeVideoSchema>;
