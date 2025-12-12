import { readdir } from "node:fs/promises";
import path from "node:path";

import { unstable_cache } from "next/cache";

import { PHOTOS } from "@/data/photos";

export interface LocalPhotoItem {
  id: string;
  src: string;
  viewerSrc: string;
  rawSrc: string;
  width: number;
  height: number;
  alt: string;
}

const IMAGES_DIR = path.join(process.cwd(), "images");
// Bump this when API output shape/params change to invalidate caches.
const PHOTO_API_VERSION = 5;
// Keep grid thumbnails reasonably small so the page loads quickly.
const PHOTO_THUMB_WIDTH = 600;
// Viewer images can be larger, but should still be bounded.
const PHOTO_VIEWER_WIDTH = 2400;
// Used purely for layout; avoids expensive per-file metadata reads.
const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 1200;

const SUPPORTED_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".heic",
  ".heif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);

function altFromFilename(filename: string): string {
  const base = filename.replace(/\.[^/.]+$/, "");
  return base.replace(/[-_]+/g, " ").trim() || "Photo";
}

function toApiPath(filename: string): string {
  // Encode each segment so spaces and parentheses work.
  return `/api/photos/${encodeURIComponent(filename)}`;
}

function fallbackPublicPhotos(): LocalPhotoItem[] {
  return PHOTOS.map((photo, index) => ({
    id: `public-photo-${String(index + 1).padStart(2, "0")}`,
    src: photo.src,
    viewerSrc: photo.src,
    rawSrc: photo.src,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
  }));
}

async function listLocalPhotosUncached(): Promise<LocalPhotoItem[]> {
  let entries: string[];
  try {
    entries = await readdir(IMAGES_DIR);
  } catch {
    return fallbackPublicPhotos();
  }

  const files = entries
    .filter((name) => SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "en"));

  if (files.length === 0) return fallbackPublicPhotos();

  const photos = files.map((filename) => {
    const base = toApiPath(filename);
    const src = `${base}?w=${PHOTO_THUMB_WIDTH}&v=${PHOTO_API_VERSION}`;
    const viewerSrc = `${base}?w=${PHOTO_VIEWER_WIDTH}&v=${PHOTO_API_VERSION}`;

    return {
      id: filename,
      src,
      viewerSrc,
      rawSrc: `${base}?raw=1&v=${PHOTO_API_VERSION}`,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      alt: altFromFilename(filename),
    } satisfies LocalPhotoItem;
  });

  return photos;
}

export const listLocalPhotos = unstable_cache(
  async () => listLocalPhotosUncached(),
  ["local-photos", String(PHOTO_API_VERSION)],
  { revalidate: 60 * 60 },
);
