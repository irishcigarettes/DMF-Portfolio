import { SITE_CONFIG } from "@/lib/metadata";
import { generateOGImage } from "@/lib/og-utils";

export const runtime = "nodejs";
export const alt = "Dalton Feldhut";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const host = new URL(SITE_CONFIG.url).host;
  return generateOGImage({
    title: SITE_CONFIG.title,
    url: host,
  });
}
