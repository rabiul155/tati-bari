import "server-only";
import { z } from "zod";

// Server-side environment, validated once at startup so a missing or
// malformed variable fails loudly instead of surfacing as a runtime bug.
// Treats an empty string (e.g. `KEY=""` in .env) as unset.
const optionalString = z
  .string()
  .optional()
  .transform((value) => value || undefined);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  // Signs admin session cookies. Generate with: openssl rand -base64 32
  SESSION_SECRET: z.string().min(32),
  // Product image storage; see lib/storage.
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  ALLOW_LOCAL_UPLOADS: z
    .enum(["true", "false", ""])
    .optional()
    .transform((value) => value === "true"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    z.flattenError(parsed.error).fieldErrors,
  );
  throw new Error("Invalid environment variables. See .env.example.");
}

export const env = parsed.data;
