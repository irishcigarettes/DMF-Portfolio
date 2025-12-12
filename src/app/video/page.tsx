import type { Metadata } from "next";

import { PageTitle } from "@/components/Typography";
import { PORTFOLIO } from "@/data/portfolio";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Video",
  description: "Selected video work and social clips.",
  path: "/video",
});

type Embed = {
  title: string;
  href: string;
  description?: string;
  embedUrl: string;
};

function stripYouTubeParenthetical(text: string): string {
  // Removes any parenthetical that contains "YouTube", e.g.:
  // "Some title (YouTube)" -> "Some title"
  // "Some title (YouTube - BTS)" -> "Some title"
  return text
    .replace(/\s*\([^)]*\byoutube\b[^)]*\)\s*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getYouTubeEmbedUrl(href: string): string | null {
  try {
    const url = new URL(href);

    // youtu.be/<id>
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace("/", "").trim();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    // youtube.com/watch?v=<id>
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

function getInstagramReelEmbedUrl(href: string): string | null {
  try {
    const url = new URL(href);
    if (!url.hostname.includes("instagram.com")) return null;

    // /reel/<shortcode>/
    const match = url.pathname.match(/\/reel\/([^/]+)\/?/);
    const shortcode = match?.[1];
    return shortcode ? `https://www.instagram.com/reel/${shortcode}/embed/` : null;
  } catch {
    return null;
  }
}

export default function VideoPage() {
  const youtubeVideos = PORTFOLIO.videos
    .map((item): Embed | null => {
      const embedUrl = getYouTubeEmbedUrl(item.href);
      if (!embedUrl) return null;
      return { ...item, embedUrl };
    })
    .filter((item): item is Embed => item !== null);

  const instagramProfile = PORTFOLIO.videos.find(
    (item) => item.href.includes("instagram.com/bumdiarydotcom") && !item.href.includes("/reel/"),
  );

  const instagramReels = PORTFOLIO.videos
    .map((item): Embed | null => {
      const embedUrl = getInstagramReelEmbedUrl(item.href);
      if (!embedUrl) return null;
      return { ...item, embedUrl };
    })
    .filter((item): item is Embed => item !== null);

  return (
    <div data-scrollable className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
        <header className="flex flex-col gap-2">
          <PageTitle className="text-accent-crimson">Video</PageTitle>
          <p className="text-secondary max-w-2xl leading-relaxed">
            Selected video work and social clips.
          </p>
        </header>

        {youtubeVideos.length > 0 ? (
          <section className="border-secondary mt-8 border-t pt-6">
            <h2 className="text-primary font-serif text-2xl font-semibold">YouTube</h2>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {youtubeVideos.map((video, idx) => (
                <div
                  key={`${video.href}-${idx}`}
                  className="border-secondary bg-secondary/5 overflow-hidden rounded-xl border"
                >
                  <div className="aspect-video w-full">
                    <iframe
                      className="h-full w-full"
                      src={video.embedUrl}
                      title={video.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  <div className="border-secondary border-t p-4">
                    <a
                      href={video.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-serif text-xl underline-offset-4 hover:underline"
                    >
                      {stripYouTubeParenthetical(video.title)}
                    </a>
                    {video.description ? (
                      <p className="text-secondary mt-1 leading-relaxed">
                        {stripYouTubeParenthetical(video.description)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-secondary mt-10 border-t pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-primary font-serif text-2xl font-semibold">Instagram</h2>
            {instagramProfile ? (
              <a
                href={instagramProfile.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-quaternary hover:text-primary font-mono text-sm underline-offset-4 hover:underline"
              >
                {instagramProfile.title} →
              </a>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {instagramReels.map((reel, idx) => (
              <div
                key={`${reel.href}-${idx}`}
                className="border-secondary bg-secondary/5 overflow-hidden rounded-xl border"
              >
                <div className="aspect-[9/16] w-full">
                  <iframe
                    className="h-full w-full"
                    src={reel.embedUrl}
                    title={
                      reel.title === "Instagram Reel" ? `Instagram reel ${idx + 1}` : reel.title
                    }
                    loading="lazy"
                    allow="encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <div className="border-secondary border-t p-4">
                  <a
                    href={reel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-serif text-lg underline-offset-4 hover:underline"
                  >
                    View on Instagram →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
