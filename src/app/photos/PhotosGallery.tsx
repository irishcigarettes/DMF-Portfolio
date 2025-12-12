"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ChevronLeft } from "@/components/icons/ChevronLeft";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { Close } from "@/components/icons/Close";
import { Download } from "@/components/icons/Download";
import { ThumbnailImage } from "@/components/ThumbnailImage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { IconButton } from "@/components/ui/IconButton";

export type PhotosGalleryItem = {
  id: string;
  src: string;
  // Optional for backwards-compat with cached payloads.
  viewerSrc?: string;
  rawSrc: string;
  width: number;
  height: number;
  alt: string;
};

export interface PhotosGalleryProps {
  photos: readonly PhotosGalleryItem[];
}

export function PhotosGallery({ photos }: PhotosGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open = activeIndex !== null;
  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;

  const canPrev = activeIndex !== null && activeIndex > 0;
  const canNext = activeIndex !== null && activeIndex < photos.length - 1;

  const goPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return null;
      return Math.max(0, current - 1);
    });
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return null;
      return Math.min(photos.length - 1, current + 1);
    });
  }, [photos.length]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, open]);

  const countLabel = useMemo(() => {
    if (activeIndex === null) return "";
    return `${activeIndex + 1} / ${photos.length}`;
  }, [activeIndex, photos.length]);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            data-no-magnetic
            className="border-secondary bg-secondary/5 hover:bg-secondary/10 mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-xl border text-left transition-[background-color] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-color-primary)]"
            aria-label={`Open ${photo.alt}`}
          >
            <ThumbnailImage
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              unoptimized
              minBlurDurationMs={80}
              className="h-auto w-full"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setActiveIndex(null);
        }}
      >
        <DialogContent className="w-[95vw] max-w-6xl p-0">
          <DialogTitle className="sr-only">Photo viewer</DialogTitle>

          {activePhoto ? (
            <div className="relative">
              <div className="border-secondary flex items-center justify-between gap-3 border-b px-3 py-2 md:px-4">
                <div className="text-secondary text-xs tabular-nums">{countLabel}</div>

                <div className="flex items-center gap-1">
                  <a
                    href={activePhoto.rawSrc}
                    download
                    className="text-secondary hover:text-primary inline-flex h-[30px] w-[30px] items-center justify-center rounded-full transition-[color,background-color] hover:bg-black/[0.08] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-color-primary)] dark:hover:bg-white/[0.12]"
                    aria-label="Download original"
                  >
                    <Download size={18} />
                  </a>

                  <IconButton
                    type="button"
                    size="default"
                    variant="ghost"
                    onClick={() => setActiveIndex(null)}
                    aria-label="Close viewer"
                    className="h-[30px] w-[30px]"
                  >
                    <Close size={18} />
                  </IconButton>
                </div>
              </div>

              <div className="bg-secondary/5 flex items-center justify-center p-3 md:p-4">
                <ThumbnailImage
                  src={activePhoto.viewerSrc ?? activePhoto.rawSrc}
                  alt={activePhoto.alt}
                  width={activePhoto.width}
                  height={activePhoto.height}
                  sizes="100vw"
                  unoptimized
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-[46px] flex h-[calc(100%-46px)] items-center justify-between px-2 md:px-3">
                <IconButton
                  type="button"
                  size="default"
                  variant="secondary"
                  onClick={goPrev}
                  disabled={!canPrev}
                  aria-label="Previous photo"
                  className="pointer-events-auto"
                >
                  <ChevronLeft size={20} />
                </IconButton>

                <IconButton
                  type="button"
                  size="default"
                  variant="secondary"
                  onClick={goNext}
                  disabled={!canNext}
                  aria-label="Next photo"
                  className="pointer-events-auto"
                >
                  <ChevronRight size={20} />
                </IconButton>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
