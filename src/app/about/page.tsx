import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "About",
  description: "About Dalton Feldhut.",
  path: "/about",
});

export default function AboutPage() {
  redirect("/resume");
}
