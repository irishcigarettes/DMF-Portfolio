import type { Metadata } from "next";

import { PORTFOLIO } from "@/data/portfolio";

/**
 * Site-wide metadata constants
 */
export const SITE_CONFIG = {
  name: "Dalton Feldhut",
  title: "Dalton Feldhut",
  description:
    "Creative communication and marketing professional based in Los Angeles. Specialized in press strategy, storytelling, and multimedia production across music, media, and marketing.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: {
    name: "Dalton Feldhut",
    twitter: undefined as string | undefined,
    twitterUrl: undefined as string | undefined,
    github: undefined as string | undefined,
  },
  social: {
    twitter: {
      handle: undefined as string | undefined,
      cardType: "summary_large_image" as const,
    },
  },
  ogImage: {
    width: 1200,
    height: 630,
  },
} as const;

/**
 * Default metadata shared across all pages
 */
export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s`,
  },
  description: SITE_CONFIG.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
  },
  twitter: SITE_CONFIG.author.twitter
    ? {
        card: SITE_CONFIG.social.twitter.cardType,
        title: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
        creator: SITE_CONFIG.author.twitter,
      }
    : undefined,
  robots: {
    index: true,
    follow: true,
  },
};

interface CreateMetadataParams {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  type?: "website" | "article";
}

/**
 * Create metadata for a page with optional overrides
 *
 * @example
 * ```ts
 * export const metadata = createMetadata({
 *   title: "My Blog Post",
 *   description: "A great post about Next.js",
 *   path: "/writing/my-blog-post",
 * });
 * ```
 */
export function createMetadata(params: CreateMetadataParams = {}): Metadata {
  const {
    title,
    description = SITE_CONFIG.description,
    path = "",
    image,
    noIndex = false,
    publishedTime,
    modifiedTime,
    type = "website",
  } = params;

  const url = `${SITE_CONFIG.url}${path}`;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      type,
      url,
      siteName: SITE_CONFIG.name,
      title: title || SITE_CONFIG.title,
      description,
      // Only include images if explicitly provided, otherwise Next.js will use opengraph-image.tsx
      ...(image && {
        images: [
          {
            url: image,
            width: SITE_CONFIG.ogImage.width,
            height: SITE_CONFIG.ogImage.height,
            alt: title || SITE_CONFIG.title,
          },
        ],
      }),
      ...(type === "article" &&
        publishedTime && {
          publishedTime,
          modifiedTime: modifiedTime || publishedTime,
          authors: [SITE_CONFIG.author.name],
        }),
    },
    twitter: SITE_CONFIG.author.twitter
      ? {
          card: SITE_CONFIG.social.twitter.cardType,
          title: title || SITE_CONFIG.title,
          description,
          creator: SITE_CONFIG.author.twitter,
          // Only include images if explicitly provided, otherwise Next.js will use opengraph-image.tsx
          ...(image && { images: [image] }),
        }
      : undefined,
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };

  return metadata;
}

/**
 * Generate JSON-LD structured data for a website
 */
export function createWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    author: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.url,
      sameAs: [PORTFOLIO.links.website, PORTFOLIO.links.instagram, PORTFOLIO.links.youtube],
    },
  };
}

interface ArticleJsonLdParams {
  title: string;
  description: string;
  path: string;
  publishedTime: string;
  modifiedTime?: string;
  image?: string;
}

/**
 * Generate JSON-LD structured data for an article
 */
export function createArticleJsonLd(params: ArticleJsonLdParams) {
  const { title, description, path, publishedTime, modifiedTime, image } = params;
  const url = `${SITE_CONFIG.url}${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.url,
      sameAs: [SITE_CONFIG.author.twitter, SITE_CONFIG.author.github],
    },
    publisher: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.url,
    },
    // Use opengraph-image.png from Next.js if no custom image provided
    image: image || `${SITE_CONFIG.url}${path}/opengraph-image.png`,
  };
}

/**
 * Generate JSON-LD structured data for a person
 */
export function createPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_CONFIG.author.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    sameAs: [PORTFOLIO.links.website, PORTFOLIO.links.instagram, PORTFOLIO.links.youtube],
    jobTitle: "Communication & Marketing",
  };
}

interface BreadcrumbJsonLdParams {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function createBreadcrumbJsonLd(params: BreadcrumbJsonLdParams) {
  const { items } = params;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Helper to truncate text to a specific length for meta descriptions
 */
export function truncateDescription(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0 ? `${truncated.slice(0, lastSpace)}...` : `${truncated}...`;
}
