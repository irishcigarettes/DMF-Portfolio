"use client";

import { useEffect, useRef } from "react";

type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function parseHexColor(input: string): Rgb | null {
  const hex = input.trim();
  if (!hex.startsWith("#")) return null;
  const raw = hex.slice(1);
  if (raw.length === 3) {
    const r = Number.parseInt(raw[0] + raw[0], 16);
    const g = Number.parseInt(raw[1] + raw[1], 16);
    const b = Number.parseInt(raw[2] + raw[2], 16);
    return { r, g, b };
  }
  if (raw.length === 6) {
    const r = Number.parseInt(raw.slice(0, 2), 16);
    const g = Number.parseInt(raw.slice(2, 4), 16);
    const b = Number.parseInt(raw.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function rgbToHsl(rgb: Rgb): Hsl {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

function hslToRgb(hsl: Hsl): Rgb {
  const h = ((hsl.h % 360) + 360) % 360;
  const s = clamp01(hsl.s);
  const l = clamp01(hsl.l);

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return {
    r: clampByte(Math.round((rp + m) * 255)),
    g: clampByte(Math.round((gp + m) * 255)),
    b: clampByte(Math.round((bp + m) * 255)),
  };
}

function isNearColor(r: number, g: number, b: number, target: Rgb, threshold: number): boolean {
  return (
    Math.abs(r - target.r) <= threshold &&
    Math.abs(g - target.g) <= threshold &&
    Math.abs(b - target.b) <= threshold
  );
}

function shouldRecolor(r: number, g: number, b: number, a: number): boolean {
  if (a < 8) return false;
  // Keep black outlines and near-white highlights intact.
  if (isBlackish(r, g, b, a)) return false;
  if (isWhitish(r, g, b, a)) return false;
  return true;
}

function isBlackish(r: number, g: number, b: number, a: number): boolean {
  if (a < 8) return false;
  return r <= 28 && g <= 28 && b <= 28;
}

function isWhitish(r: number, g: number, b: number, a: number): boolean {
  if (a < 8) return false;
  return r >= 242 && g >= 242 && b >= 242;
}

function applyPixelOutline(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  thickness: number,
): Uint8ClampedArray {
  // Outside-only outline based on alpha dilation (doesn't overwrite the original shape).
  const original = new Uint8ClampedArray(rgba);
  const size = width * height;
  const mask = new Uint8Array(size);

  const neighbors = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ] as const;

  // Seed mask with any non-transparent pixels, excluding black outlines already present.
  for (let i = 0; i < size; i++) {
    const off = i * 4;
    const a = original[off + 3];
    if (a < 8) continue;
    if (isBlackish(original[off], original[off + 1], original[off + 2], a)) continue;
    mask[i] = 1;
  }

  let dilated = new Uint8Array(mask);
  const steps = Math.max(1, Math.round(thickness));
  for (let step = 0; step < steps; step++) {
    const next = new Uint8Array(dilated);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (dilated[idx]) continue;
        // Turn on if any neighbor is on.
        for (const [dx, dy] of neighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (dilated[ny * width + nx]) {
            next[idx] = 1;
            break;
          }
        }
      }
    }
    dilated = next;
  }

  // Paint outline where dilated mask is true but original alpha is transparent.
  for (let i = 0; i < size; i++) {
    const off = i * 4;
    const a = original[off + 3];
    if (a >= 8) continue;
    if (!dilated[i]) continue;
    rgba[off] = 0;
    rgba[off + 1] = 0;
    rgba[off + 2] = 0;
    rgba[off + 3] = 255;
  }

  return rgba;
}

type Component = {
  pixels: number[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

function findComponents(imageData: ImageData, bg: Rgb): Component[] {
  const { width, height, data } = imageData;
  const visited = new Uint8Array(width * height);
  const components: Component[] = [];

  const neighbors = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ] as const;

  function idxToOffset(idx: number): number {
    return idx * 4;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;

      const off = idxToOffset(idx);
      const r = data[off];
      const g = data[off + 1];
      const b = data[off + 2];
      const a = data[off + 3];

      // Background: sample-based (solid yellow in the sprite).
      if (a < 8 || isNearColor(r, g, b, bg, 8)) {
        visited[idx] = 1;
        continue;
      }

      // BFS flood fill
      const queue: number[] = [idx];
      visited[idx] = 1;

      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      const pixels: number[] = [];

      while (queue.length > 0) {
        const cur = queue.pop();
        if (cur === undefined) break;
        pixels.push(cur);

        const cy = Math.floor(cur / width);
        const cx = cur - cy * width;
        if (cx < minX) minX = cx;
        if (cy < minY) minY = cy;
        if (cx > maxX) maxX = cx;
        if (cy > maxY) maxY = cy;

        for (const [dx, dy] of neighbors) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const nidx = ny * width + nx;
          if (visited[nidx]) continue;

          const noff = idxToOffset(nidx);
          const nr = data[noff];
          const ng = data[noff + 1];
          const nb = data[noff + 2];
          const na = data[noff + 3];

          if (na < 8 || isNearColor(nr, ng, nb, bg, 8)) {
            visited[nidx] = 1;
            continue;
          }

          visited[nidx] = 1;
          queue.push(nidx);
        }
      }

      components.push({ pixels, minX, minY, maxX, maxY });
    }
  }

  // Filter out obvious non-cursor stuff (e.g. the wide black strip at the bottom).
  const filtered = components.filter((c) => {
    const w = c.maxX - c.minX + 1;
    const h = c.maxY - c.minY + 1;
    if (w > imageData.width * 0.8) return false;
    if (h > imageData.height * 0.8) return false;
    if (c.pixels.length < 80) return false;
    return true;
  });

  // Keep the three biggest remaining blobs (arrow, ball, hand).
  filtered.sort((a, b) => b.pixels.length - a.pixels.length);
  return filtered.slice(0, 3);
}

function computeHotspotForComponent(
  component: Component,
  kind: "arrow" | "hand" | "ball",
): {
  x: number;
  y: number;
} {
  const w = component.maxX - component.minX + 1;
  const h = component.maxY - component.minY + 1;
  const pad = 2;

  if (kind === "ball") {
    return { x: Math.round(w / 2) + pad, y: Math.round(h / 2) + pad };
  }

  // BBox-based guesses (these sprites are consistent and small).
  if (kind === "arrow") return { x: pad, y: pad };
  // Hand: click point around the index finger tip (near top center).
  return { x: Math.round(w * 0.55) + pad, y: pad };
}

function setCursorVar(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value);
}

export function ThemedCursor() {
  const didInitRef = useRef(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const finePointer = window.matchMedia?.("(pointer: fine)")?.matches ?? true;
    if (!finePointer) return;

    let cancelled = false;

    async function ensureImage(): Promise<HTMLImageElement> {
      const existing = imgRef.current;
      if (existing) return existing;

      const img = new Image();
      img.decoding = "async";
      img.src = "/cursors/tennis-sprite.png";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load cursor sprite"));
      });
      imgRef.current = img;
      return img;
    }

    function getAccentCrimson(): Rgb {
      const computed = getComputedStyle(document.documentElement);
      // Prefer the cursor-specific crimson (stable across themes), fall back to the
      // current accent (used for the name/header).
      const rawCursor = computed.getPropertyValue("--cursor-crimson");
      const rawAccent = computed.getPropertyValue("--accent-crimson");
      const parsed = parseHexColor(rawCursor) ?? parseHexColor(rawAccent);
      // Fallback to a visible crimson if parsing fails.
      return parsed ?? { r: 106, g: 6, b: 32 };
    }

    async function buildAndApplyCursors(): Promise<void> {
      try {
        const img = await ensureImage();
        if (cancelled) return;

        const USER_SCALE = 0.5; // requested: 50% smaller cursors
        const MAX_CURSOR_SIZE = 96; // keep well under common 128x128 browser limit

        const spriteCanvas = document.createElement("canvas");
        spriteCanvas.width = img.naturalWidth || img.width;
        spriteCanvas.height = img.naturalHeight || img.height;

        const spriteCtx = spriteCanvas.getContext("2d", { willReadFrequently: true });
        if (!spriteCtx) return;
        spriteCtx.imageSmoothingEnabled = false;
        spriteCtx.drawImage(img, 0, 0);

        const spriteData = spriteCtx.getImageData(0, 0, spriteCanvas.width, spriteCanvas.height);

        // Background color is the top-left pixel (solid yellow in this sprite).
        const bgOff = 0;
        const bg: Rgb = {
          r: spriteData.data[bgOff],
          g: spriteData.data[bgOff + 1],
          b: spriteData.data[bgOff + 2],
        };

        const components = findComponents(spriteData, bg);
        if (components.length < 3) return;

        // Sort left-to-right: arrow, ball, hand.
        components.sort((a, b) => a.minX - b.minX);

        const accent = getAccentCrimson();
        const accentHsl = rgbToHsl(accent);
        const pad = 2;

        const kinds: Array<"arrow" | "ball" | "hand"> = ["arrow", "ball", "hand"];
        const vars: Array<{ cssVar: string }> = [
          { cssVar: "--cursor-default" },
          { cssVar: "--cursor-progress" },
          { cssVar: "--cursor-pointer" },
        ];

        for (let i = 0; i < 3; i++) {
          const component = components[i];
          const kind = kinds[i];
          const w = component.maxX - component.minX + 1;
          const h = component.maxY - component.minY + 1;

          const outCanvas = document.createElement("canvas");
          outCanvas.width = w + pad * 2;
          outCanvas.height = h + pad * 2;
          const outCtx = outCanvas.getContext("2d");
          if (!outCtx) continue;
          outCtx.imageSmoothingEnabled = false;

          const outImage = outCtx.createImageData(outCanvas.width, outCanvas.height);
          const out = outImage.data;

          for (const pixIdx of component.pixels) {
            const py = Math.floor(pixIdx / spriteData.width);
            const px = pixIdx - py * spriteData.width;

            const srcOff = pixIdx * 4;
            const r = spriteData.data[srcOff];
            const g = spriteData.data[srcOff + 1];
            const b = spriteData.data[srcOff + 2];
            const a = spriteData.data[srcOff + 3];

            // Skip background-like pixels (defensive).
            if (a < 8 || isNearColor(r, g, b, bg, 8)) continue;

            const relX = px - component.minX + pad;
            const relY = py - component.minY + pad;
            const dstOff = (relY * outCanvas.width + relX) * 4;

            if (shouldRecolor(r, g, b, a)) {
              /*
                Match the hue/saturation of the chosen crimson, but keep per-pixel
                shading by mapping the original pixel's luminance into lightness.

                This ensures neutral grays (e.g. tennis ball shading) also become
                crimson-tinted, while black outlines and near-white highlights stay.
              */
              const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
              const l = clamp01(0.1 + luminance * 0.8);
              const mapped = hslToRgb({ h: accentHsl.h, s: accentHsl.s, l });
              out[dstOff] = mapped.r;
              out[dstOff + 1] = mapped.g;
              out[dstOff + 2] = mapped.b;
              out[dstOff + 3] = a;
            } else {
              out[dstOff] = r;
              out[dstOff + 1] = g;
              out[dstOff + 2] = b;
              out[dstOff + 3] = a;
            }
          }

          outCtx.putImageData(outImage, 0, 0);

          // Cursor URLs are ignored if the image is too large, so scale down if needed.
          const initialHotspot = computeHotspotForComponent(component, kind);
          const maxDim = Math.max(outCanvas.width, outCanvas.height);
          const limitScale = maxDim > MAX_CURSOR_SIZE ? MAX_CURSOR_SIZE / maxDim : 1;
          const scale = Math.min(1, USER_SCALE * limitScale);

          let finalCanvas = outCanvas;
          let hotspot = initialHotspot;

          if (scale !== 1) {
            const scaled = document.createElement("canvas");
            scaled.width = Math.max(1, Math.round(outCanvas.width * scale));
            scaled.height = Math.max(1, Math.round(outCanvas.height * scale));
            const scaledCtx = scaled.getContext("2d");
            if (scaledCtx) {
              scaledCtx.imageSmoothingEnabled = false;
              scaledCtx.drawImage(outCanvas, 0, 0, scaled.width, scaled.height);
              finalCanvas = scaled;
              hotspot = {
                x: Math.max(0, Math.round(initialHotspot.x * scale)),
                y: Math.max(0, Math.round(initialHotspot.y * scale)),
              };
            }
          }

          // Add a pixelated black outline at FINAL size so it stays visible after scaling.
          // Slightly thicker so inner gaps (e.g. between fingers) read as outlined.
          const outlineCtx = finalCanvas.getContext("2d", { willReadFrequently: true });
          if (outlineCtx) {
            outlineCtx.imageSmoothingEnabled = false;
            const finalData = outlineCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
            applyPixelOutline(finalData.data, finalCanvas.width, finalCanvas.height, 2);
            outlineCtx.putImageData(finalData, 0, 0);
          }

          const dataUrl = finalCanvas.toDataURL("image/png");
          // Important: keep this value to a single cursor image (no commas).
          // The CSS layer provides the fallback cursor list.
          const cursorValue = `url("${dataUrl}") ${hotspot.x} ${hotspot.y}`;
          setCursorVar(vars[i].cssVar, cursorValue);
        }
      } catch {
        // If anything fails, keep default cursors.
      }
    }

    void buildAndApplyCursors();

    // Recompute when dark mode toggles (next-themes sets a class on <html>).
    const observer = new MutationObserver(() => {
      void buildAndApplyCursors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observerRef.current = observer;

    return () => {
      cancelled = true;
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  return null;
}
