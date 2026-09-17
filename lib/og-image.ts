// Social preview images (Facebook, WhatsApp). Product photos are stored as
// WebP, which some crawlers don't accept, so Cloudinary is asked for a
// 1200×630 JPEG instead. Local development images are returned unchanged.
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

export function toOgImageUrl(url: string): string {
  const match = CLOUDINARY_UPLOAD.exec(url);
  if (!match) return url;
  const transform = `c_pad,b_auto,w_${OG_IMAGE_WIDTH},h_${OG_IMAGE_HEIGHT},f_jpg,q_auto`;
  return `${match[1]}${transform}/${match[2]}`;
}
