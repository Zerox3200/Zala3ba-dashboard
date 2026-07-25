const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/+$/,
  ""
);
const STORAGE_BASE_URL = (
  import.meta.env.VITE_STORAGE_BASE_URL || API_BASE_URL
).replace(/\/+$/, "");

/**
 * Builds a public URL for files stored under Laravel's /storage disk.
 * Supports absolute URLs and relative paths like "question_media/file.jpg".
 */
export const mediaUrl = (path?: string | null): string => {
  if (!path) return "";

  const trimmed = path.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.replace(/^\/+/, "").replace(/^storage\//i, "");
  return `${STORAGE_BASE_URL}/storage/${normalized}`;
};
