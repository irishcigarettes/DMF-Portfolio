import type { Metadata } from "next";
import Link from "next/link";

import { PageTitle } from "@/components/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { listLocalPhotos } from "@/lib/local-photos";
import { createMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

import { PhotosGallery } from "./PhotosGallery";

export const metadata: Metadata = createMetadata({
  title: "Photos",
  description: "Photos from the local images folder.",
  path: "/photos",
});

export const revalidate = 3600;

const PER_PAGE = 18;

function parsePage(value: string | undefined): number {
  if (!value) return 1;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const allPhotos = await listLocalPhotos();

  const total = allPhotos.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(totalPages, parsePage(params.page));

  const startIndex = (page - 1) * PER_PAGE;
  const endIndex = Math.min(total, startIndex + PER_PAGE);
  const photos = allPhotos.slice(startIndex, endIndex);
  const prevHref = page > 1 ? `/photos?page=${page - 1}` : null;
  const nextHref = page < totalPages ? `/photos?page=${page + 1}` : null;

  return (
    <div data-scrollable className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
        <header className="flex flex-col gap-2">
          <PageTitle className="text-accent-crimson">Photos</PageTitle>
          <p className="text-secondary max-w-2xl leading-relaxed">
            Photos from <code>DMF-Portfolio/images</code>. Click any image to view it on-site.
          </p>
          {total > 0 ? (
            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <span className="text-quaternary font-mono text-xs">
                Showing {startIndex + 1}–{endIndex} of {total} (page {page} of {totalPages})
              </span>
              <nav aria-label="Photos pagination" className="flex items-center gap-2">
                {prevHref ? (
                  <Link
                    href={prevHref}
                    className={cn(buttonVariants({ size: "xs", variant: "secondary" }))}
                  >
                    Prev
                  </Link>
                ) : (
                  <span
                    className={cn(
                      buttonVariants({ size: "xs", variant: "secondary" }),
                      "opacity-50",
                    )}
                  >
                    Prev
                  </span>
                )}
                {nextHref ? (
                  <Link
                    href={nextHref}
                    className={cn(buttonVariants({ size: "xs", variant: "secondary" }))}
                  >
                    Next
                  </Link>
                ) : (
                  <span
                    className={cn(
                      buttonVariants({ size: "xs", variant: "secondary" }),
                      "opacity-50",
                    )}
                  >
                    Next
                  </span>
                )}
              </nav>
            </div>
          ) : null}
        </header>

        <section className="border-secondary mt-8 border-t pt-6">
          <PhotosGallery photos={photos} />
        </section>

        {totalPages > 1 ? (
          <footer className="border-secondary mt-8 flex items-center justify-between border-t pt-6">
            <div className="text-quaternary font-mono text-xs">
              Page {page} of {totalPages}
            </div>
            <nav aria-label="Photos pagination" className="flex items-center gap-2">
              {prevHref ? (
                <Link
                  href={prevHref}
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
                >
                  Prev page
                </Link>
              ) : (
                <span
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "opacity-50")}
                >
                  Prev page
                </span>
              )}
              {nextHref ? (
                <Link
                  href={nextHref}
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
                >
                  Next page
                </Link>
              ) : (
                <span
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "opacity-50")}
                >
                  Next page
                </span>
              )}
            </nav>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
