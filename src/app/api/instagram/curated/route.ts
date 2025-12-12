import type { NextResponse } from "next/server";

import { cachedResponse, errorResponse } from "@/lib/api-utils";
import { getCuratedInstagramPhotos } from "@/lib/instagram-curation";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");

    const parsed = limitParam ? Number(limitParam) : 12;
    const limit = Number.isFinite(parsed) ? Math.min(50, Math.max(1, Math.floor(parsed))) : 12;

    const photos = await getCuratedInstagramPhotos(limit);

    // Cache for 1 hour; internal curation has its own longer cache.
    return cachedResponse(photos, 3600);
  } catch (error) {
    console.error("Error fetching curated Instagram photos:", error);
    return errorResponse("Failed to fetch curated Instagram photos");
  }
}
