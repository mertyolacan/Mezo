/**
 * Build an optimized Cloudinary URL with transformations.
 * Works with both full Cloudinary URLs and raw public IDs.
 */

type ImageOptions = {
  width?: number;
  height?: number;
  quality?: number | "auto";
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "fill" | "fit" | "scale" | "thumb" | "crop" | "pad";
  gravity?: "auto" | "face" | "center";
};

const CLOUDINARY_BASE_REGEX = /https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\//;

export function cloudinaryUrl(src: string, options: ImageOptions = {}): string {
  if (!src) return src;

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "fill",
    gravity = "auto",
  } = options;

  const transforms: string[] = [`f_${format}`, `q_${quality}`];
  if (crop) transforms.push(`c_${crop}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (gravity) transforms.push(`g_${gravity}`);

  const tStr = transforms.join(",");

  // If it's already a Cloudinary URL, inject transforms
  if (CLOUDINARY_BASE_REGEX.test(src)) {
    return src.replace(CLOUDINARY_BASE_REGEX, (match) => `${match}${tStr}/`);
  }

  // Otherwise return as-is (external URL or relative path)
  return src;
}

/** Preset helpers */
export const thumbUrl = (src: string, size = 200) =>
  cloudinaryUrl(src, { width: size, height: size, crop: "thumb", gravity: "auto" });

export const cardUrl = (src: string) =>
  cloudinaryUrl(src, { width: 480, height: 480, crop: "fill", gravity: "auto" });

export const heroUrl = (src: string) =>
  cloudinaryUrl(src, { width: 1200, height: 630, crop: "fill", gravity: "auto" });
