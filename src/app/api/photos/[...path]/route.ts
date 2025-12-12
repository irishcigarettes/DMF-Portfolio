import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const IMAGES_DIR = path.join(process.cwd(), "images");
const CACHE_CONTROL_IMMUTABLE = "public, max-age=31536000, s-maxage=31536000, immutable";
const PHOTO_CACHE_DIR = path.join(process.cwd(), ".next", "cache", "photos");

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

function getContentType(ext: string): string {
  switch (ext) {
    case ".avif":
      return "image/avif";
    case ".gif":
      return "image/gif";
    case ".jpeg":
    case ".jpg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".heic":
    case ".heif":
      // Served as webp by default (converted), so content-type handled at call site.
      return "image/heic";
    default:
      return "application/octet-stream";
  }
}

function safeResolveUnder(baseDir: string, relativePath: string): string {
  const resolved = path.resolve(baseDir, relativePath);
  const base = path.resolve(baseDir);
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    throw new Error("Invalid path");
  }
  return resolved;
}

function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function heicFallbackSvg(filename: string): string {
  const label = escapeXml(filename);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="Image preview unavailable">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.06)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1200" height="900" rx="48" fill="url(#bg)" />
  <g fill="rgba(255,255,255,0.82)" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" text-anchor="middle">
    <text x="600" y="420" font-size="44" font-weight="700">Preview unavailable</text>
    <text x="600" y="486" font-size="26" fill="rgba(255,255,255,0.66)">Open to download the original file</text>
    <text x="600" y="560" font-size="22" fill="rgba(255,255,255,0.50)">${label}</text>
  </g>
</svg>
  `.trim();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path: pathParts } = await context.params;
  const rel = pathParts.map(decodeURIComponent).join(path.sep);
  const ext = path.extname(rel).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return new Response("Unsupported file type", { status: 400 });
  }

  let filePath: string;
  try {
    filePath = safeResolveUnder(IMAGES_DIR, rel);
  } catch {
    return new Response("Invalid path", { status: 400 });
  }

  const url = new URL(_request.url);
  const raw = url.searchParams.get("raw") === "1";
  const v = url.searchParams.get("v") ?? "";
  const widthParam = url.searchParams.get("w");
  const requestedWidth = widthParam ? Number(widthParam) : null;
  const resizeWidth =
    typeof requestedWidth === "number" && Number.isFinite(requestedWidth)
      ? Math.max(200, Math.min(2400, Math.round(requestedWidth)))
      : null;

  let mtimeMs = 0;
  try {
    const fileStat = await stat(filePath);
    mtimeMs = fileStat.mtimeMs;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  // If raw is requested (or it's an animated GIF), return the file as-is.
  if (raw || ext === ".gif") {
    try {
      const buffer = await readFile(filePath);
      // Next's Response typing doesn't accept Node.js Buffer directly.
      // Convert to a Uint8Array (same bytes, correct type).
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": getContentType(ext),
          "Cache-Control": CACHE_CONTROL_IMMUTABLE,
        },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  // Generate a browser-friendly thumbnail (WebP) for everything else.
  // - For HEIC/HEIF: try sharp first, then fall back to WASM convert -> sharp.
  // - For JPG/PNG/WebP/AVIF: sharp reads directly.
  try {
    const cacheKey = createHash("sha1")
      .update(`${rel}|w=${resizeWidth ?? "orig"}|v=${v}|mtime=${mtimeMs}|q=85`)
      .digest("hex");
    const cachePath = path.join(PHOTO_CACHE_DIR, `${cacheKey}.webp`);

    try {
      const cached = await readFile(cachePath);
      return new Response(new Uint8Array(cached), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": CACHE_CONTROL_IMMUTABLE,
        },
      });
    } catch {
      // Cache miss, generate below.
    }

    // HEIC/HEIF: sharp may only fail at encode-time, so we must catch around toBuffer.
    if (ext === ".heic" || ext === ".heif") {
      try {
        let pipeline = sharp(filePath, { failOn: "none", sequentialRead: true }).rotate();
        if (resizeWidth) {
          pipeline = pipeline.resize(resizeWidth, undefined, { withoutEnlargement: true });
        }
        const webp = await pipeline.webp({ quality: 85 }).toBuffer();
        try {
          await mkdir(PHOTO_CACHE_DIR, { recursive: true });
          await writeFile(cachePath, webp);
        } catch {
          // Best-effort cache write.
        }

        return new Response(new Uint8Array(webp), {
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": CACHE_CONTROL_IMMUTABLE,
          },
        });
      } catch {
        try {
          const { default: heicConvert } = await import("heic-convert");
          const input = await readFile(filePath);
          const jpeg = (await heicConvert({
            buffer: input,
            format: "JPEG",
            quality: 0.92,
          })) as Buffer;

          let pipeline = sharp(jpeg).rotate();
          if (resizeWidth) {
            pipeline = pipeline.resize(resizeWidth, undefined, { withoutEnlargement: true });
          }
          const webp = await pipeline.webp({ quality: 85 }).toBuffer();
          try {
            await mkdir(PHOTO_CACHE_DIR, { recursive: true });
            await writeFile(cachePath, webp);
          } catch {
            // Best-effort cache write.
          }

          return new Response(new Uint8Array(webp), {
            headers: {
              "Content-Type": "image/webp",
              "Cache-Control": CACHE_CONTROL_IMMUTABLE,
            },
          });
        } catch {
          const filename = path.basename(filePath);
          return new Response(heicFallbackSvg(filename), {
            headers: {
              "Content-Type": "image/svg+xml; charset=utf-8",
              "Cache-Control": CACHE_CONTROL_IMMUTABLE,
            },
          });
        }
      }
    }

    let pipeline = sharp(filePath, { failOn: "none", sequentialRead: true }).rotate();
    if (resizeWidth) {
      pipeline = pipeline.resize(resizeWidth, undefined, { withoutEnlargement: true });
    }
    const webp = await pipeline.webp({ quality: 85 }).toBuffer();
    try {
      await mkdir(PHOTO_CACHE_DIR, { recursive: true });
      await writeFile(cachePath, webp);
    } catch {
      // Best-effort cache write.
    }

    return new Response(new Uint8Array(webp), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": CACHE_CONTROL_IMMUTABLE,
      },
    });
  } catch {
    const filename = path.basename(filePath);
    return new Response(heicFallbackSvg(filename), {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": CACHE_CONTROL_IMMUTABLE,
      },
    });
  }
}
