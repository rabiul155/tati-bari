// Image storage. Uses Cloudinary when its credentials are set, otherwise
// the local disk (development only: serverless hosts such as Vercel have no
// persistent disk).
import "server-only";
import { env } from "@/lib/env";
import { cloudinaryStorage } from "@/lib/storage/cloudinary";
import { diskStorage } from "@/lib/storage/local";

export type StoredImage = {
  url: string;
  // Provider-side identifier, passed back to delete().
  key: string;
};

export type ImageStorage = {
  // `data` is an already processed image; `name` is a unique file name
  // without extension.
  upload(data: Buffer, name: string, format: "webp"): Promise<StoredImage>;
  delete(key: string): Promise<void>;
};

export function getImageStorage(): ImageStorage {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    return cloudinaryStorage({
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
      apiSecret: CLOUDINARY_API_SECRET,
    });
  }
  if (env.NODE_ENV === "production" && !env.ALLOW_LOCAL_UPLOADS) {
    throw new Error(
      "Image storage is not configured. Set the CLOUDINARY_* variables (see .env.example).",
    );
  }
  return diskStorage;
}
