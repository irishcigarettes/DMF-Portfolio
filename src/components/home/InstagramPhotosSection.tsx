"use client";

import { motion } from "motion/react";
import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import type { CuratedInstagramPhoto } from "@/lib/instagram-curation";

import { Section, SectionHeading } from "../shared/ListComponents";

interface InstagramPhotosSectionProps {
  limit?: number;
}

export function InstagramPhotosSection({ limit = 12 }: InstagramPhotosSectionProps) {
  const { data, error, isLoading } = useSWR<CuratedInstagramPhoto[]>(
    `/api/instagram/curated?limit=${limit}`,
    fetcher,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.25 }}
    >
      <Section>
        <div className="flex items-baseline justify-between gap-4">
          <SectionHeading>Photos</SectionHeading>
          <a
            href="https://www.instagram.com/irishcigarettes/"
            target="_blank"
            rel="noopener"
            className="font-mono text-xs text-[var(--text-color-tertiary)] underline underline-offset-4"
          >
            View all
          </a>
        </div>

        {error ? (
          <p className="mt-3 font-mono text-sm text-[var(--text-color-quaternary)]">
            Photos are unavailable right now.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {(isLoading
              ? (Array.from(
                  { length: limit },
                  () => null,
                ) satisfies Array<CuratedInstagramPhoto | null>)
              : (data ?? [])
            ).map((item, idx) => {
              if (!item) {
                return (
                  <div
                    key={`skeleton-${idx}`}
                    className="aspect-square w-full rounded-md bg-[var(--bg-color-secondary)]/60"
                  />
                );
              }

              const alt = item.caption?.trim() ? item.caption.trim() : "Instagram photo";

              return (
                <motion.a
                  key={item.id}
                  href={item.permalink}
                  target="_blank"
                  rel="noopener"
                  className="group relative block overflow-hidden rounded-md bg-[var(--bg-color-secondary)]"
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <img
                    src={item.imageUrl}
                    alt={alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </motion.a>
              );
            })}
          </div>
        )}
      </Section>
    </motion.div>
  );
}
