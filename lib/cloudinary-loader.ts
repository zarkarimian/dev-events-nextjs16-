/**
 * Custom Cloudinary image loader
 * Bypasses Next.js image optimization to avoid private IP warnings
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // If it's already a full Cloudinary URL, return as-is
  if (src.startsWith("https://res.cloudinary.com")) {
    return src;
  }

  // If it's a relative path, return as-is
  if (src.startsWith("/")) {
    return src;
  }

  // Otherwise return the source unchanged
  return src;
}
