import type { Metadata } from "next";
import Image from "next/image";

import { MagazineFlipbook } from "@/components/magazine/MagazineFlipbook";
import {
    InlineLink,
    List,
    ListItem,
    ListItemLabel,
    ListItemSubLabel,
} from "@/components/shared/ListComponents";
import { PageTitle } from "@/components/Typography";
import { MAGAZINE_ISSUES } from "@/data/magazine";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Magazine",
  description: "Print issues and magazine work.",
  path: "/magazine",
});

export default function MagazinePage() {
  const issue = MAGAZINE_ISSUES[0];

  if (!issue) return null;

  const frontCoverUrl = issue.pageImageUrls[0] ?? issue.coverImageUrl;
  const backCoverUrl = issue.pageImageUrls.at(-1) ?? issue.coverImageUrl;
  const hasMultipleIssues = MAGAZINE_ISSUES.length > 1;

  return (
    <div data-scrollable className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:py-16">
        <header className="flex flex-col gap-2">
          <PageTitle className="text-accent-crimson">Magazine</PageTitle>
          <p className="text-secondary max-w-3xl leading-relaxed">
            Now reading: <span className="font-serif">{issue.title}</span> —{" "}
            {issue.tagline ? `${issue.tagline} · ` : ""}
            {issue.printNumber} · released: {issue.releaseDate}
          </p>
          <p className="text-quaternary text-sm">
            Source: <InlineLink href={issue.sourceUrl}>{issue.sourceUrl}</InlineLink>
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="border-secondary bg-secondary relative overflow-hidden rounded-xl border">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={frontCoverUrl}
                  alt={`${issue.title} front cover`}
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-contain p-3"
                  priority
                />
              </div>
            </div>

            <div className="border-secondary bg-secondary relative overflow-hidden rounded-xl border">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={backCoverUrl}
                  alt={`${issue.title} back cover`}
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-contain p-3"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-primary font-serif text-2xl">Read</h2>
          <MagazineFlipbook title={issue.title} pageImageUrls={issue.pageImageUrls} />
        </section>

        {hasMultipleIssues && (
          <section className="flex flex-col gap-4">
            <h2 className="text-primary font-serif text-2xl">All issues</h2>
            <List className="gap-3 sm:gap-2">
              {MAGAZINE_ISSUES.map((item) => (
                <ListItem key={item.slug} href={`/magazine/${item.slug}`} className="items-start">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <ListItemLabel className="line-clamp-none font-serif text-xl">
                      {item.title}
                    </ListItemLabel>
                    <ListItemSubLabel>
                      {item.tagline ? `${item.tagline} · ` : ""}
                      {item.printNumber} · released: {item.releaseDate}
                    </ListItemSubLabel>
                  </div>
                  <span className="text-quaternary hidden font-mono text-sm md:inline">View</span>
                </ListItem>
              ))}
            </List>
          </section>
        )}
      </div>
    </div>
  );
}
