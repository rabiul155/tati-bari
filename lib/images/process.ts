// Normalizes uploaded product photos: checks the file really is an image,
// applies the camera rotation, limits the size, strips metadata (phone
// photos can contain GPS location) and converts to WebP.
import "server-only";
import sharp from "sharp";

const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp"]);
const MAX_DIMENSION = 2000;

export class InvalidImageError extends Error {}

export async function processProductImage(input: Buffer) {
  let format: string | undefined;
  try {
    ({ format } = await sharp(input).metadata());
  } catch {
    throw new InvalidImageError("এই ফাইলটি সমর্থিত কোনো ছবি নয়।");
  }
  if (!format || !ACCEPTED_FORMATS.has(format)) {
    throw new InvalidImageError("JPEG, PNG বা WebP ছবি ব্যবহার করুন।");
  }

  const { data, info } = await sharp(input, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height, format: "webp" as const };
}
