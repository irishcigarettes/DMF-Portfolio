"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

function base64EncodeUtf8(input: string): string {
  // btoa expects Latin1; this makes it safe for UTF-8.
  return btoa(unescape(encodeURIComponent(input)));
}

function shimmerSvg(w: number, h: number): string {
  return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Loading image">
  <defs>
    <linearGradient id="g">
      <stop stop-color="rgba(0,0,0,0.08)" offset="20%" />
      <stop stop-color="rgba(0,0,0,0.14)" offset="50%" />
      <stop stop-color="rgba(0,0,0,0.08)" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="rgba(0,0,0,0.08)" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="0.9s" repeatCount="indefinite"  />
</svg>
  `.trim();
}

export type ThumbnailImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  wrapperClassName?: string;
  /**
   * Ensures the blurred placeholder is visible for at least this long (ms).
   * Useful for cached/priority images that would otherwise "pop" in instantly.
   */
  minBlurDurationMs?: number;
};

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function ThumbnailImage(props: ThumbnailImageProps) {
  const {
    alt = "",
    className,
    wrapperClassName,
    width,
    height,
    minBlurDurationMs = 0,
    ...rest
  } = props;
  const [loaded, setLoaded] = useState(false);
  const rafId = useRef<number | null>(null);
  const timeoutId = useRef<number | null>(null);
  const mountedAt = useRef<number>(nowMs());

  const blurDataURL = useMemo(() => {
    const w = typeof width === "number" ? width : 72;
    const h = typeof height === "number" ? height : 72;
    return `data:image/svg+xml;base64,${base64EncodeUtf8(shimmerSvg(w, h))}`;
  }, [width, height]);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      if (timeoutId.current !== null) window.clearTimeout(timeoutId.current);
    };
  }, []);

  return (
    <span className={cn("block h-full w-full", wrapperClassName)}>
      <Image
        alt={alt}
        width={width}
        height={height}
        {...rest}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoadingComplete={() => {
          // Ensures we render at least one frame of the blurred state,
          // even when the image is cached / loads instantly.
          const elapsed = nowMs() - mountedAt.current;
          const remaining = Math.max(0, minBlurDurationMs - elapsed);

          rafId.current = requestAnimationFrame(() => {
            if (remaining > 0) {
              timeoutId.current = window.setTimeout(() => setLoaded(true), remaining);
              return;
            }

            setLoaded(true);
          });
        }}
        className={cn(
          // Match Stories/Columns thumbnail transition (fade in + deblur).
          "transition-[filter,opacity] duration-500 ease-out will-change-[filter,opacity]",
          loaded ? "blur-0 opacity-100" : "opacity-0 blur-md",
          className,
        )}
      />
    </span>
  );
}
