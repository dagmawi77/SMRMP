/**
 * Resolves an artifact `video_url` into something renderable.
 * Returns `{ type: 'iframe' | 'video', src }`, or null when there is no URL.
 */
export default function getEmbedVideoUrl(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;

  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  if (ytMatch) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  if (trimmed.match(/\.(mp4|webm|ogg)($|\?)/i)) {
    return { type: 'video', src: trimmed };
  }

  return { type: 'iframe', src: trimmed };
}
