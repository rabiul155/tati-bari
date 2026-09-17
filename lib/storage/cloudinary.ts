// Cloudinary via its REST upload API (signed requests), so no SDK is needed.
// https://cloudinary.com/documentation/image_upload_api_reference
import "server-only";
import { createHash } from "node:crypto";
import type { ImageStorage } from "@/lib/storage";

const FOLDER = "products";

type Config = { cloudName: string; apiKey: string; apiSecret: string };

// Signature: SHA-1 of the sorted "key=value" params joined with "&",
// followed by the API secret.
function signedParams(params: Record<string, string>, config: Config) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const all = { ...params, timestamp };
  const toSign = Object.keys(all)
    .sort()
    .map((key) => `${key}=${all[key as keyof typeof all]}`)
    .join("&");
  const signature = createHash("sha1").update(toSign + config.apiSecret).digest("hex");
  return { ...all, api_key: config.apiKey, signature };
}

async function call(config: Config, action: "upload" | "destroy", body: FormData) {
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/${action}`,
    { method: "POST", body },
  );
  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message = (json.error as { message?: string } | undefined)?.message;
    throw new Error(`Cloudinary ${action} failed: ${message ?? response.status}`);
  }
  return json;
}

export function cloudinaryStorage(config: Config): ImageStorage {
  return {
    async upload(data, name) {
      const body = new FormData();
      for (const [key, value] of Object.entries(
        signedParams({ folder: FOLDER, public_id: name }, config),
      )) {
        body.append(key, value);
      }
      body.append("file", new Blob([new Uint8Array(data)], { type: "image/webp" }));
      const result = await call(config, "upload", body);
      return { url: String(result.secure_url), key: String(result.public_id) };
    },
    async delete(key) {
      const body = new FormData();
      for (const [k, value] of Object.entries(signedParams({ public_id: key }, config))) {
        body.append(k, value);
      }
      await call(config, "destroy", body);
    },
  };
}
