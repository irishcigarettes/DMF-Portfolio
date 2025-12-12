import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { MagazineFlipbook } from "@/components/magazine/MagazineFlipbook";
import { InlineLink } from "@/components/shared/ListComponents";
import { PageTitle } from "@/components/Typography";
import { getMagazineIssue } from "@/data/magazine";
import { createMetadata } from "@/lib/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const issue = getMagazineIssue(slug);
    if (!issue) return createMetadata({ title: "Magazine", path: "/magazine" });

    const frontCoverUrl = issue.pageImageUrls[0] ?? issue.coverImageUrl;

    return createMetadata({
      title: `${issue.title} — Magazine`,
      description: `${issue.printNumber} · released: ${issue.releaseDate}`,
      path: `/magazine/${issue.slug}`,
      image: frontCoverUrl,
    });
  });
}

export default async function MagazineIssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const issue = getMagazineIssue(slug);

  if (!issue) notFound();

  const frontCoverUrl = issue.pageImageUrls[0] ?? issue.coverImageUrl;
  const backCoverUrl = issue.pageImageUrls.at(-1) ?? issue.coverImageUrl;

  return (
    <div data-scrollable className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:py-16">
        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <PageTitle className="text-accent-crimson">{issue.title}</PageTitle>
            <p className="text-secondary max-w-3xl leading-relaxed">
              {issue.tagline ? `${issue.tagline} · ` : ""}
              {issue.printNumber} · released: {issue.releaseDate}
            </p>
            <p className="text-quaternary text-sm">
              Source: <InlineLink href={issue.sourceUrl}>{issue.sourceUrl}</InlineLink>
            </p>
          </div>
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
      </div>
    </div>
  );
}
