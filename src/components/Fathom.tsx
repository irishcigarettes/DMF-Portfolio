"use client";

import { load, trackPageview } from "fathom-client";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const siteId = process.env.NEXT_PUBLIC_FATHOM_SITE_ID;
  const includedDomains = (process.env.NEXT_PUBLIC_FATHOM_INCLUDED_DOMAINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Load the Fathom script on mount
  useEffect(() => {
    if (!siteId) return;
    load(siteId, {
      auto: false,
      ...(includedDomains.length > 0 ? { includedDomains } : {}),
    });
  }, [includedDomains, siteId]);

  // Record a pageview when route changes
  useEffect(() => {
    if (!pathname) return;
    if (!siteId) return;

    trackPageview({
      url: pathname + searchParams?.toString(),
      referrer: document.referrer,
    });
  }, [pathname, searchParams, siteId]);

  return null;
}

export default function Fathom() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
