import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { LatestSlideshow, type LatestSlideshowItem } from "@/components/LatestSlideshow";
import { MAGAZINE_ISSUES } from "@/data/magazine";
import { PORTFOLIO } from "@/data/portfolio";
import { createMetadata, createPersonJsonLd } from "@/lib/metadata";
import { getBestPageImageUrl } from "@/lib/utils/page-preview";

export const metadata: Metadata = createMetadata({
  title: "Dalton Feldhut",
  description:
    "Creative communication and marketing professional based in Los Angeles. Specialized in press strategy, storytelling, and multimedia production across music, media, and marketing.",
  path: "/",
});

function StoryCategoryPill({ category }: { category: "written" | "edited" }) {
  const label = category === "written" ? "Written" : "Edited";

  return (
    <span
      className={[
        "border-secondary text-quaternary rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
        category === "edited" ? "border-dashed" : "",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default async function Home() {
  const personJsonLd = createPersonJsonLd();
  const magazineIssue = MAGAZINE_ISSUES[0];
  const magazineHref = magazineIssue ? `/magazine/${magazineIssue.slug}` : "/magazine";
  const magazineCoverUrl = magazineIssue
    ? (magazineIssue.pageImageUrls[0] ?? magazineIssue.coverImageUrl)
    : null;

  const latestBase = [
    { section: "Stories", href: "/stories", items: PORTFOLIO.stories.slice(0, 1) },
    { section: "Columns", href: "/columns", items: PORTFOLIO.columns.slice(0, 2) },
  ].flatMap((group) =>
    group.items.map((item) => ({
      section: group.section,
      sectionHref: group.href,
      title: item.title,
      href: item.href,
      description: item.description,
      category: "category" in item ? item.category : undefined,
    })),
  );

  const latest: LatestSlideshowItem[] = await Promise.all(
    latestBase.map(async (item) => ({
      ...item,
      thumbnailUrl: await getBestPageImageUrl(item.href, { revalidateSeconds: 60 * 60 * 24 }),
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div data-scrollable className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
          <header className="flex flex-col gap-3">
            <div className="text-quaternary text-sm font-medium tracking-wider uppercase">
              Stories • Columns • Video • Magazine
            </div>
            <h1 className="text-accent-crimson font-serif text-5xl font-semibold tracking-tight md:text-6xl">
              {PORTFOLIO.person.name.toUpperCase()}
            </h1>
            <div className="text-secondary font-mono text-sm">
              {PORTFOLIO.person.location} • {PORTFOLIO.person.email} • {PORTFOLIO.person.phone}
            </div>
          </header>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <section className="border-secondary border-t pt-6">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-accent-latest font-serif text-3xl font-semibold md:text-4xl">
                    The Latest
                  </h2>
                  <span className="text-quaternary font-mono text-sm">From my desk</span>
                </div>

                <div className="mt-6">
                  <LatestSlideshow items={latest} />
                </div>
              </section>

              <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
                <section className="border-secondary border-t pt-6">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-accent-stories font-serif text-3xl font-semibold md:text-4xl">
                      Stories
                    </h2>
                    <Link
                      href="/stories"
                      className="text-quaternary hover:text-primary font-mono text-sm"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {PORTFOLIO.stories.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-baseline justify-between gap-3"
                      >
                        <span className="text-primary min-w-0 underline-offset-4 group-hover:underline">
                          {s.title}
                        </span>
                        <span className="shrink-0">
                          <StoryCategoryPill category={s.category} />
                        </span>
                      </a>
                    ))}
                  </div>
                </section>

                <section className="border-secondary border-t pt-6">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-accent-columns font-serif text-3xl font-semibold md:text-4xl">
                      Columns
                    </h2>
                    <Link
                      href="/columns"
                      className="text-quaternary hover:text-primary font-mono text-sm"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {PORTFOLIO.columns.map((c) => (
                      <a
                        key={c.href}
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {c.title}
                      </a>
                    ))}
                  </div>
                </section>
              </div>

              {magazineIssue && magazineCoverUrl ? (
                <section className="border-secondary mt-10 border-t pt-6">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-accent-crimson font-serif text-3xl font-semibold md:text-4xl">
                      Magazine
                    </h2>
                    <Link
                      href="/magazine"
                      className="text-quaternary hover:text-primary font-mono text-sm"
                    >
                      View
                    </Link>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr] sm:items-start">
                    <Link
                      href={magazineHref}
                      className="border-secondary bg-secondary group relative overflow-hidden rounded-xl border"
                    >
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={magazineCoverUrl}
                          alt={`${magazineIssue.title} cover`}
                          fill
                          sizes="160px"
                          className="object-contain p-2 transition-transform group-hover:scale-[1.02]"
                        />
                      </div>
                    </Link>

                    <div className="flex flex-col gap-2">
                      <p className="text-secondary leading-relaxed">
                        Now reading: <span className="font-serif">{magazineIssue.title}</span> —{" "}
                        {magazineIssue.tagline ? `${magazineIssue.tagline} · ` : ""}
                        {magazineIssue.printNumber} · released: {magazineIssue.releaseDate}
                      </p>

                      <div className="[&_a]:text-primary flex flex-wrap items-center gap-x-4 gap-y-1 [&_a]:italic [&_a]:underline-offset-4 [&_a:hover]:underline">
                        <Link href={magazineHref}>Read issue</Link>
                        <a href={magazineIssue.sourceUrl} target="_blank" rel="noopener noreferrer">
                          Source
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="lg:col-span-4">
              <div className="border-secondary rounded-xl border bg-white p-6 dark:bg-black">
                <h2 className="text-accent-about font-serif text-3xl font-semibold md:text-4xl">
                  About
                </h2>
                <p className="text-secondary mt-3 leading-relaxed">{PORTFOLIO.summary}</p>

                <div className="[&_a]:text-primary mt-6 flex flex-col gap-2 [&_a]:italic [&_a]:underline-offset-4 [&_a:hover]:underline">
                  <a href={PORTFOLIO.links.website} target="_blank" rel="noopener noreferrer">
                    The Bum Diary
                  </a>
                  <a href={PORTFOLIO.links.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                  <a href={PORTFOLIO.links.youtube} target="_blank" rel="noopener noreferrer">
                    YouTube
                  </a>
                  <Link href="/resume">Resume</Link>
                  <a href={`mailto:${PORTFOLIO.person.email}`}>Contact</a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
