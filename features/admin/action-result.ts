import { z } from "zod";

// What admin server actions return to forms. Successful saves usually
// redirect instead of returning.
export type ActionResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[] | undefined> };

export function validationFailed(error: z.ZodError): ActionResult {
  return {
    ok: false,
    error: "Please fix the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[] | undefined>,
  };
}
