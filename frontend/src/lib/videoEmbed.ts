/**
 * Converts a YouTube or Vimeo video URL into an embed URL.
 * Returns null if the URL cannot be converted (unknown format or invalid URL).
 *
 * Accepted formats:
 * - YouTube: youtube.com/watch?v=ID, www.youtube.com/watch?v=ID, youtu.be/ID
 * - Vimeo: vimeo.com/ID, www.vimeo.com/ID, player.vimeo.com/video/ID
 */
export function toEmbedUrl(videoUrl: string): string | null {
  if (!videoUrl) return null;

  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.toLowerCase();

    // YouTube — youtube.com/watch?v=ID
    if (hostname === "youtube.com" || hostname === "www.youtube.com") {
      const videoId = url.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // YouTube — youtu.be/ID
    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      const videoId = url.pathname.slice(1).split("/")[0].split("?")[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Vimeo — vimeo.com/ID or player.vimeo.com/video/ID
    if (
      hostname === "vimeo.com" ||
      hostname === "www.vimeo.com" ||
      hostname === "player.vimeo.com"
    ) {
      const segments = url.pathname.split("/").filter(Boolean);
      const videoId = segments.find((s) => /^\d+$/.test(s));
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}
