// Stores images in ./.uploads and serves them through app/uploads/[...path].
// Files written to public/ after a build are not served by `next start`,
// hence the separate folder and route.
import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImageStorage } from "@/lib/storage";

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");
const URL_PREFIX = "/uploads";
const SAFE_NAME = /^[a-z0-9-]+\.(webp)$/;

export const diskStorage: ImageStorage = {
  async upload(data, name, format) {
    const file = `${name}.${format}`;
    if (!SAFE_NAME.test(file)) throw new Error("Invalid file name");
    await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(LOCAL_UPLOAD_DIR, file), data);
    return { url: `${URL_PREFIX}/${file}`, key: file };
  },
  async delete(key) {
    if (!SAFE_NAME.test(key)) return;
    await rm(path.join(LOCAL_UPLOAD_DIR, key), { force: true });
  },
};

// Returns the file for a name like "abc.webp", or null.
export async function readLocalUpload(name: string): Promise<Buffer | null> {
  if (!SAFE_NAME.test(name)) return null;
  try {
    return await readFile(path.join(LOCAL_UPLOAD_DIR, name));
  } catch {
    return null;
  }
}
