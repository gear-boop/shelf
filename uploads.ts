import { R2Bucket } from "@/lib/cf";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const ALLOWED_TYPES = Object.keys(EXTENSIONS);
export const MAX_BYTES = 8 * 1024 * 1024;

export const isAllowedImage = (type: string): boolean => type in EXTENSIONS;

export const putImage = async (
  bucket: R2Bucket,
  bytes: ArrayBuffer,
  contentType: string,
): Promise<{ key: string; type: string }> => {
  const ext = EXTENSIONS[contentType] ?? "jpg";
  const key = `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await bucket.put(key, bytes, {
    httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
  });
  return { key, type: contentType };
};

export const getImage = async (bucket: R2Bucket, key: string) => {
  if (!/^p-[a-z0-9]+\.(jpg|png|webp)$/i.test(key)) return null;
  return bucket.get(key);
};

export const removeImage = async (bucket: R2Bucket, key: string): Promise<void> => {
  await bucket.delete(key);
};
