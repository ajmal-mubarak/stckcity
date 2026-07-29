/**
 * Resolves a media URL returned by the Django backend.
 *
 * DRF returns absolute URLs (e.g. "http://127.0.0.1:8000/media/...")
 * when it has access to the request context, which ViewSets always do.
 * This helper is a safe fallback: if the URL is already absolute, use it
 * as-is; otherwise prefix it with the API host.
 */
export const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/api\/?$/, '');

export function mediaUrl(path) {
  if (!path) return null;
  // Already an absolute URL — return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Relative path — prefix with the backend host
  return `${BASE}${path}`;
}
