import { unstable_cache } from "next/cache";

import type { InstagramMediaItem } from "./instagram";
import { fetchInstagramMedia } from "./instagram";
import { detectPeopleInImage } from "./vision/google-vision";

export interface CuratedInstagramPhoto {
  id: string;
  imageUrl: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
  engagementScore: number;
}

function parseCommaSeparatedEnv(name: string): Set<string> {
  const raw = process.env[name];
  if (!raw) return new Set<string>();

  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function getImageUrl(item: InstagramMediaItem): string | null {
  return item.media_url ?? item.thumbnail_url ?? null;
}

function isAllowedMediaType(item: InstagramMediaItem): boolean {
  return item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM";
}

function toCurated(item: InstagramMediaItem): CuratedInstagramPhoto | null {
  const imageUrl = getImageUrl(item);
  if (!imageUrl) return null;

  const likeCount = item.like_count ?? 0;
  const commentsCount = item.comments_count ?? 0;

  return {
    id: item.id,
    imageUrl,
    permalink: item.permalink,
    caption: item.caption,
    timestamp: item.timestamp,
    likeCount,
    commentsCount,
    engagementScore: likeCount + commentsCount,
  };
}

async function getCuratedInstagramPhotosUncached(limit: number): Promise<CuratedInstagramPhoto[]> {
  const forceAllowIds = parseCommaSeparatedEnv("INSTAGRAM_FORCE_ALLOW_IDS");
  const forceBlockIds = parseCommaSeparatedEnv("INSTAGRAM_FORCE_BLOCK_IDS");

  const sourceLimit = Math.min(200, Math.max(60, limit * 10));
  const media = await fetchInstagramMedia({ limit: sourceLimit, revalidateSeconds: 3600 });

  const candidates = media
    .filter(isAllowedMediaType)
    .map(toCurated)
    .filter((v): v is CuratedInstagramPhoto => v !== null)
    .filter((item) => !forceBlockIds.has(item.id))
    .sort((a, b) => {
      const scoreDiff = b.engagementScore - a.engagementScore;
      if (scoreDiff !== 0) return scoreDiff;
      return b.timestamp.localeCompare(a.timestamp);
    });

  const curated: CuratedInstagramPhoto[] = [];

  for (const item of candidates) {
    if (curated.length >= limit) break;

    if (forceAllowIds.has(item.id)) {
      curated.push(item);
      continue;
    }

    try {
      const detection = await detectPeopleInImage(item.imageUrl);
      if (!detection.containsPeople) {
        curated.push(item);
      }
    } catch (error) {
      // Privacy-safe default: if detection fails, exclude the item.
      console.error("People detection failed for Instagram media", {
        id: item.id,
        error,
      });
    }
  }

  return curated;
}

/**
 * Cached curation (rank + filter), keyed by the `limit` argument.
 */
export const getCuratedInstagramPhotos = unstable_cache(
  async (limit: number) => getCuratedInstagramPhotosUncached(limit),
  ["ig-curated-photos"],
  { revalidate: 60 * 60 * 6 },
);
