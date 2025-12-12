type FetchRevalidateOptions = {
  /**
   * Cache duration for the remote HTML fetch (in seconds).
   * Defaults to 24 hours.
   */
  revalidateSeconds?: number;
};

function decodeHtmlEntities(value: string): string {
  // We only need a tiny subset for URLs.
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#38;", "&")
    .replaceAll("&#x26;", "&")
    .replaceAll("&#X26;", "&");
}

function toAbsoluteUrl(candidateUrl: string, baseUrl: string): string | null {
  try {
    return new URL(decodeHtmlEntities(candidateUrl), baseUrl).toString();
  } catch {
    return null;
  }
}

function extractMetaContent(
  headHtml: string,
  attrs: { property?: string; name?: string },
): string | null {
  const { property, name } = attrs;
  const key = property ? "property" : "name";
  const value = property ?? name;
  if (!value) return null;

  // Handle both attribute orders:
  // <meta property="og:image" content="...">
  // <meta content="..." property="og:image">
  const patterns = [
    new RegExp(`<meta[^>]*\\s+${key}=["']${value}["'][^>]*\\s+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]*\\s+content=["']([^"']+)["'][^>]*\\s+${key}=["']${value}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = headHtml.match(pattern);
    const content = match?.[1]?.trim();
    if (content) return decodeHtmlEntities(content);
  }

  return null;
}

function extractHeadHtml(html: string): string {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (headMatch?.[1]) return headMatch[1];
  return html.substring(0, 10000);
}

function extractBodyChunk(html: string, limit: number): string {
  const bodyOpenIdx = html.search(/<body[^>]*>/i);
  if (bodyOpenIdx === -1) return html.substring(0, limit);
  const bodyTagEnd = html.indexOf(">", bodyOpenIdx);
  if (bodyTagEnd === -1) return html.substring(bodyOpenIdx, bodyOpenIdx + limit);
  return html.substring(bodyTagEnd + 1, bodyTagEnd + 1 + limit);
}

function extractFirstImageUrlFromHtmlChunk(htmlChunk: string): string | null {
  // Prefer a plain src.
  const srcMatch = htmlChunk.match(/<img[^>]*\s(?:src|data-src)=["']([^"']+)["'][^>]*>/i);
  const src = srcMatch?.[1]?.trim();
  if (src && !src.startsWith("data:")) return src;

  // Fallback to first srcset entry.
  const srcSetMatch = htmlChunk.match(/<img[^>]*\ssrcset=["']([^"']+)["'][^>]*>/i);
  const srcSet = srcSetMatch?.[1]?.trim();
  if (!srcSet) return null;

  // Pick the *largest* candidate from srcset to avoid blurry thumbnails.
  // Format examples:
  // - "url 320w, url 640w, url 1280w"
  // - "url 1x, url 2x"
  const candidates = srcSet
    .split(",")
    .map((part) => part.trim())
    .map((part) => {
      const [urlPart, descriptor] = part.split(/\s+/);
      if (!urlPart) return null;
      const url = decodeHtmlEntities(urlPart.trim());
      if (url.startsWith("data:")) return null;

      const raw = descriptor?.trim() ?? "";
      const wMatch = raw.match(/^(\d+)w$/i);
      const xMatch = raw.match(/^(\d+(?:\.\d+)?)x$/i);
      const score = wMatch ? Number(wMatch[1]) : xMatch ? Number(xMatch[1]) * 1000 : 0;
      return { url, score };
    })
    .filter((c): c is { url: string; score: number } => !!c);

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.url ?? null;
}

function extractTopContentImageUrl(html: string, baseUrl: string): string | null {
  // Try to scope to main/article first to avoid grabbing logos/nav icons.
  const bodyChunk = extractBodyChunk(html, 250_000);

  const mainMatch = bodyChunk.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const articleMatch = bodyChunk.match(/<article[^>]*>([\s\S]*?)<\/article>/i);

  const candidates = [mainMatch?.[1], articleMatch?.[1], bodyChunk].filter(
    (chunk): chunk is string => !!chunk,
  );

  for (const chunk of candidates) {
    const found = extractFirstImageUrlFromHtmlChunk(chunk);
    if (!found) continue;
    const absolute = toAbsoluteUrl(found, baseUrl);
    if (absolute) return absolute;
  }

  return null;
}

function normalizeThumbnailUrl(absoluteUrl: string): string {
  try {
    const u = new URL(absoluteUrl);
    // Framer image CDN supports `width`/`height` query params. Make sure we request
    // a reasonably large source so downscaling stays crisp on high-DPI screens.
    if (u.hostname === "framerusercontent.com") {
      const widthParam = u.searchParams.get("width");
      const currentWidth = widthParam ? Number(widthParam) : 0;
      const targetWidth = Number.isFinite(currentWidth) ? Math.max(currentWidth, 1600) : 1600;
      u.searchParams.set("width", String(targetWidth));
      // Let the CDN keep aspect ratio.
      u.searchParams.delete("height");
    }
    return u.toString();
  } catch {
    return absoluteUrl;
  }
}

/**
 * Fetch a remote page and extract a best-effort "top of page" image URL.
 *
 * Priority order:
 * 1) First image found in the page content (within `<main>` / `<article>` / `<body>`), near the top
 * 2) OpenGraph (`og:image`)
 * 3) Twitter card (`twitter:image`)
 */
export async function getBestPageImageUrl(
  url: string,
  options: FetchRevalidateOptions = {},
): Promise<string | null> {
  const revalidateSeconds = options.revalidateSeconds ?? 60 * 60 * 24;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
      next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const topImage = extractTopContentImageUrl(html, url);
    if (topImage) return normalizeThumbnailUrl(topImage);

    const headHtml = extractHeadHtml(html);

    const ogImage =
      extractMetaContent(headHtml, { property: "og:image" }) ??
      extractMetaContent(headHtml, { name: "og:image" });
    const twitterImage =
      extractMetaContent(headHtml, { property: "twitter:image" }) ??
      extractMetaContent(headHtml, { name: "twitter:image" });

    const candidate = ogImage ?? twitterImage;
    if (!candidate) return null;

    const absolute = toAbsoluteUrl(candidate, url);
    return absolute ? normalizeThumbnailUrl(absolute) : null;
  } catch {
    return null;
  }
}
