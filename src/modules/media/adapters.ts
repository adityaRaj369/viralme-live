import { MediaPlatform } from "@prisma/client";

export type ParsedMedia = {
  platform: MediaPlatform;
  externalId: string;
  thumbnail?: string;
  embedUrl?: string;
  mediaType: "video" | "shorts" | "reel" | "link";
};

export function parseYouTubeUrl(url: string): ParsedMedia | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    let shorts = false;

    if (host === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0] || null;
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2] || null;
        shorts = true;
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2] || null;
      } else {
        id = u.searchParams.get("v");
      }
    }

    if (!id) return null;
    return {
      platform: shorts ? MediaPlatform.YOUTUBE_SHORTS : MediaPlatform.YOUTUBE,
      externalId: id,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      mediaType: shorts ? "shorts" : "video",
    };
  } catch {
    return null;
  }
}

export function parseInstagramUrl(url: string): ParsedMedia | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "instagram.com" && host !== "www.instagram.com") return null;

    const parts = u.pathname.split("/").filter(Boolean);
    // /reel/CODE or /p/CODE
    if (parts.length >= 2 && (parts[0] === "reel" || parts[0] === "p" || parts[0] === "reels")) {
      const code = parts[1];
      return {
        platform: MediaPlatform.INSTAGRAM,
        externalId: code,
        embedUrl: `https://www.instagram.com/p/${code}/embed`,
        mediaType: parts[0].startsWith("reel") ? "reel" : "video",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function parseExternalUrl(url: string): ParsedMedia | null {
  const yt = parseYouTubeUrl(url);
  if (yt) return yt;
  const ig = parseInstagramUrl(url);
  if (ig) return ig;
  try {
    new URL(url);
    return {
      platform: MediaPlatform.EXTERNAL,
      externalId: url,
      mediaType: "link",
    };
  } catch {
    return null;
  }
}

export const YouTubeAdapter = { parse: parseYouTubeUrl };
export const InstagramAdapter = { parse: parseInstagramUrl };
