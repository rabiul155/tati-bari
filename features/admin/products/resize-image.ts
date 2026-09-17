// Shrinks a photo in the browser before upload, so large phone photos fit
// the upload size limit and upload quickly on mobile data. The server still
// validates and re-encodes the result.
const MAX_DIMENSION = 2000;
const MAX_BYTES = 3.5 * 1024 * 1024;

export async function resizeImageForUpload(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    // Applies the camera's EXIF rotation in current browsers.
    bitmap = await createImageBitmap(file);
  } catch {
    // The browser cannot decode it; let the server decide.
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.9, 0.8, 0.65]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (blob && blob.size <= MAX_BYTES) {
      return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    }
  }
  return file;
}
