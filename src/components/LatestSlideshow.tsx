"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ChevronLeft } from "@/components/icons/ChevronLeft";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { ThumbnailImage } from "@/components/ThumbnailImage";
import { IconButton } from "@/components/ui/IconButton";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { cn } from "@/lib/utils";

export type LatestSlideshowItem = {
  section: string;
  sectionHref: string;
  title: string;
  href: string;
  description?: string;
  category?: "written" | "edited";
  thumbnailUrl: string | null;
};

export type LatestSlideshowProps = {
  items: LatestSlideshowItem[];
  autoAdvanceMs?: number;
  className?: string;
};

function CategoryPill({ category }: { category: "written" | "edited" }) {
  const label = category === "written" ? "Written" : "Edited";

  return (
    <span
      className={cn(
        "border-secondary text-quaternary rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
        category === "edited" ? "border-dashed" : "",
      )}
    >
      {label}
    </span>
  );
}

export function LatestSlideshow({ items, autoAdvanceMs = 8000, className }: LatestSlideshowProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const count = safeItems.length;

  const currentIndex = count === 0 ? 0 : ((index % count) + count) % count;
  const item = count > 0 ? safeItems[currentIndex] : null;

  useEffect(() => {
    if (count <= 1) return;
    if (autoAdvanceMs <= 0) return;
    if (paused) return;

    const id = window.setInterval(() => {
      setIndex((prev) => prev + 1);
    }, autoAdvanceMs);

    return () => window.clearInterval(id);
  }, [autoAdvanceMs, count, paused]);

  if (!item) return null;

  const goPrev = () => setIndex((prev) => prev - 1);
  const goNext = () => setIndex((prev) => prev + 1);

  const sectionIsExternal = item.sectionHref.startsWith("http");

  return (
    <div
      className={cn(
        "border-secondary bg-secondary/10 relative overflow-hidden rounded-xl border",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Latest stories and columns"
    >
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-[240px_1fr]">
        <div className="border-secondary bg-secondary/10 relative overflow-hidden sm:border-r">
          <div className="relative aspect-[16/10] w-full">
            {item.thumbnailUrl ? (
              <ThumbnailImage
                src={item.thumbnailUrl}
                alt=""
                width={1200}
                height={750}
                sizes="(min-width: 1024px) 240px, 100vw"
                quality={95}
                minBlurDurationMs={120}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="from-secondary/0 to-secondary/20 text-quaternary flex h-full w-full items-center justify-center bg-gradient-to-br font-mono text-xs tracking-wider uppercase">
                No image
              </div>
            )}
          </div>
        </div>

        <div className="relative flex min-w-0 flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-quaternary font-mono text-xs tracking-wider uppercase">
                {sectionIsExternal ? (
                  <a
                    href={item.sectionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    {item.section}
                  </a>
                ) : (
                  <Link href={item.sectionHref} className="hover:text-primary">
                    {item.section}
                  </Link>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <IconButton
                type="button"
                size="xs"
                variant="outline"
                onClick={goPrev}
                disabled={count <= 1}
              >
                <VisuallyHidden>Previous</VisuallyHidden>
                <ChevronLeft size={16} />
              </IconButton>
              <IconButton
                type="button"
                size="xs"
                variant="outline"
                onClick={goNext}
                disabled={count <= 1}
              >
                <VisuallyHidden>Next</VisuallyHidden>
                <ChevronRight size={16} />
              </IconButton>
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary min-w-0 font-serif text-2xl leading-tight underline-offset-4 hover:underline"
            >
              {item.title}
            </a>

            {(item.section === "Stories" || item.section === "Columns") && item.category ? (
              <span className="shrink-0">
                <CategoryPill category={item.category} />
              </span>
            ) : null}
          </div>

          {item.description ? <p className="text-secondary italic">{item.description}</p> : null}

          {count > 1 ? (
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="text-quaternary font-mono text-xs">
                {currentIndex + 1} / {count}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {safeItems.map((_, i) => {
                  const selected = i === currentIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={cn(
                        "border-secondary h-2.5 w-2.5 rounded-full border transition-colors",
                        selected ? "bg-primary" : "hover:bg-secondary/30 bg-transparent",
                      )}
                      aria-label={`Go to item ${i + 1} of ${count}`}
                      aria-current={selected ? "true" : undefined}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
