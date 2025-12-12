import "./globals.css";

import type { Metadata } from "next";
import { Courier_Prime, Special_Elite } from "next/font/google";
import { PropsWithChildren } from "react";

import { ClientShell } from "@/components/ClientShell";
import { DEFAULT_METADATA, SITE_CONFIG } from "@/lib/metadata";
import { cn } from "@/lib/utils";

import { Providers } from "./providers";

const sans = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

// Headings/titles: distressed "stamp/typewriter" look.
const serif = Special_Elite({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  alternates: {
    types: {
      "application/rss+xml": `${SITE_CONFIG.url}/writing/rss.xml`,
    },
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="bg-white subpixel-antialiased dark:bg-black"
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#fff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="rgb(10, 10, 10)" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={cn(sans.variable, serif.variable)}>
        <Providers>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  );
}
