"use client";

import Image from "next/image";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ArrowLeft } from "@/components/icons/ArrowLeft";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

type FlipDirection = 1 | -1;

type FlipState = {
  from: number;
  to: number;
  dir: FlipDirection;
};

export function MagazineFlipbook({
  title,
  pageImageUrls,
  className,
  initialIndex = 0,
}: {
  title: string;
  pageImageUrls: string[];
  className?: string;
  initialIndex?: number;
}) {
  const pages = useMemo(
    () => pageImageUrls.map((src) => (src.includes("?") ? src : `${src}?scale-down-to=2048`)),
    [pageImageUrls],
  );

  const [index, setIndex] = useState(() => Math.min(Math.max(initialIndex, 0), pages.length - 1));
  const [flip, setFlip] = useState<FlipState | null>(null);

  const pointerStartX = useRef<number | null>(null);

  const canGoPrev = index > 0 && !flip;
  const canGoNext = index < pages.length - 1 && !flip;

  const startFlip = useCallback(
    (to: number, dir: FlipDirection) => {
      if (flip) return;
      if (to < 0 || to >= pages.length) return;
      if (to === index) return;

      setFlip({ from: index, to, dir });
      setIndex(to);
    },
    [flip, index, pages.length],
  );

  const goPrev = useCallback(() => startFlip(index - 1, -1), [index, startFlip]);
  const goNext = useCallback(() => startFlip(index + 1, 1), [index, startFlip]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (canGoPrev) goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (canGoNext) goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canGoNext, canGoPrev, goNext, goPrev]);

  const onPointerDown = useCallback((e: ReactPointerEvent) => {
    pointerStartX.current = e.clientX;
  }, []);

  const onPointerUp = useCallback(
    (e: ReactPointerEvent) => {
      const startX = pointerStartX.current;
      pointerStartX.current = null;
      if (startX === null) return;

      const dx = e.clientX - startX;
      const threshold = 40;

      // swipe left -> next page, swipe right -> prev page
      if (dx <= -threshold && canGoNext) {
        goNext();
        return;
      }
      if (dx >= threshold && canGoPrev) {
        goPrev();
        return;
      }

      // If it wasn't a swipe, treat as a click on left/right half
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const isRightHalf = e.clientX > rect.left + rect.width / 2;
      if (isRightHalf && canGoNext) {
        goNext();
      } else if (!isRightHalf && canGoPrev) {
        goPrev();
      }
    },
    [canGoNext, canGoPrev, goNext, goPrev],
  );

  if (pages.length === 0) return null;

  const baseIndex = flip ? flip.to : index;
  const turningIndex = flip ? flip.from : null;
  const dir: FlipDirection = flip?.dir ?? 1;

  return (
    <div className={cn("mx-auto flex w-full max-w-4xl flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <IconButton size="sm" onClick={goPrev} disabled={!canGoPrev} aria-label="Previous page">
          <ArrowLeft size={18} />
        </IconButton>
        <div className="text-quaternary flex-1 text-center font-mono text-xs">
          Page {index + 1} / {pages.length}
        </div>
        <IconButton size="sm" onClick={goNext} disabled={!canGoNext} aria-label="Next page">
          <ArrowRight size={18} />
        </IconButton>
      </div>

      <div
        className={cn(
          "border-secondary bg-secondary relative overflow-hidden rounded-xl border",
          "touch-pan-y select-none",
        )}
        style={{ perspective: "1400px" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="relative aspect-[3/4] w-full">
          {/* Base page (revealed beneath the flip) */}
          <Image
            src={pages[baseIndex]}
            alt={`${title} page ${baseIndex + 1}`}
            fill
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-contain p-3"
            priority={baseIndex === 0}
          />

          {/* Subtle spine shadow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/10 dark:bg-white/10"
          />

          {/* Turning page */}
          {turningIndex !== null && flip && (
            <div className="absolute inset-0" aria-hidden>
              <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                <div className={cn("absolute inset-0", dir === 1 ? "origin-right" : "origin-left")}>
                  <div
                    className="absolute inset-0"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <AnimatedTurn dir={dir} onDone={() => setFlip(null)}>
                        <Image
                          src={pages[turningIndex]}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 960px, 100vw"
                          className="object-contain p-3"
                        />
                      </AnimatedTurn>
                    </div>

                    {/* Back face (simple paper) */}
                    <div
                      className="bg-secondary absolute inset-0"
                      style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Moving shadow to sell the flip */}
              <div
                className={cn(
                  "pointer-events-none absolute inset-0",
                  dir === 1
                    ? "bg-[linear-gradient(to_left,rgba(0,0,0,0.22),transparent_60%)]"
                    : "bg-[linear-gradient(to_right,rgba(0,0,0,0.22),transparent_60%)]",
                )}
              />
            </div>
          )}
        </div>
      </div>

      <p className="text-quaternary text-center text-xs">
        Tip: click/tap the left/right side, swipe, or use arrow keys.
      </p>
    </div>
  );
}

function AnimatedTurn({
  dir,
  onDone,
  children,
}: {
  dir: FlipDirection;
  onDone: () => void;
  children: ReactNode;
}) {
  // Use a div with inline animation so we don't depend on route-level motion.
  // We keep it intentionally minimal and deterministic.
  const [hasStarted] = useState(true);

  return (
    <div
      className={cn("absolute inset-0", dir === 1 ? "origin-right" : "origin-left")}
      style={{
        transformStyle: "preserve-3d",
        animation: hasStarted
          ? dir === 1
            ? "mag-turn-forward 520ms cubic-bezier(.2,.7,.2,1) forwards"
            : "mag-turn-back 520ms cubic-bezier(.2,.7,.2,1) forwards"
          : undefined,
      }}
      onAnimationEnd={onDone}
    >
      {children}
      <style jsx>{`
        @keyframes mag-turn-forward {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(-180deg);
          }
        }
        @keyframes mag-turn-back {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(180deg);
          }
        }
      `}</style>
    </div>
  );
}
