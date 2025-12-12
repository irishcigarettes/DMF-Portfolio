export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export interface InstagramMediaItem {
  id: string;
  media_type: InstagramMediaType;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

interface InstagramMediaResponse {
  data: InstagramMediaItem[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
  };
}

function getInstagramConfig(): {
  accessToken: string;
  igUserId: string;
  apiVersion: string;
} {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_IG_USER_ID;
  const apiVersion = process.env.INSTAGRAM_GRAPH_API_VERSION ?? "v20.0";

  if (!accessToken) {
    throw new Error("Missing env var: INSTAGRAM_ACCESS_TOKEN");
  }
  if (!igUserId) {
    throw new Error("Missing env var: INSTAGRAM_IG_USER_ID");
  }

  return { accessToken, igUserId, apiVersion };
}

function buildMediaUrl(params: {
  apiVersion: string;
  igUserId: string;
  accessToken: string;
  limit: number;
  after?: string;
}): string {
  const { apiVersion, igUserId, accessToken, limit, after } = params;
  const url = new URL(`https://graph.facebook.com/${apiVersion}/${igUserId}/media`);

  url.searchParams.set(
    "fields",
    [
      "id",
      "media_type",
      "media_url",
      "thumbnail_url",
      "permalink",
      "caption",
      "timestamp",
      "like_count",
      "comments_count",
    ].join(","),
  );
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", accessToken);
  if (after) url.searchParams.set("after", after);

  return url.toString();
}

export async function fetchInstagramMedia(params?: {
  /**
   * Total media items to collect (across pages). Defaults to 60.
   */
  limit?: number;
  /**
   * Next.js fetch revalidation window, in seconds. Defaults to 1 hour.
   */
  revalidateSeconds?: number;
}): Promise<InstagramMediaItem[]> {
  const { accessToken, igUserId, apiVersion } = getInstagramConfig();

  const totalLimit = params?.limit ?? 60;
  const revalidateSeconds = params?.revalidateSeconds ?? 3600;

  const collected: InstagramMediaItem[] = [];
  let after: string | undefined;

  // Instagram/Graph API limits are typically <= 100 per request.
  const pageSize = Math.min(100, totalLimit);

  // Avoid infinite loops if cursors behave unexpectedly.
  for (let page = 0; page < 10 && collected.length < totalLimit; page += 1) {
    const url = buildMediaUrl({
      apiVersion,
      igUserId,
      accessToken,
      limit: pageSize,
      after,
    });

    const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Instagram Graph API error: ${res.status} ${body}`);
    }

    const json = (await res.json()) as InstagramMediaResponse;
    collected.push(...(json.data ?? []));

    const nextAfter = json.paging?.cursors?.after;
    if (!nextAfter || nextAfter === after) break;
    after = nextAfter;
  }

  return collected.slice(0, totalLimit);
}
