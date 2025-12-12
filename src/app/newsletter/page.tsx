import type { Metadata } from "next";
import Link from "next/link";

import { Instagram } from "@/components/icons/Instagram";
import { Mail } from "@/components/icons/Mail";
import { YouTubeIcon } from "@/components/icons/SocialIcons";
import {
  List,
  ListItem,
  ListItemLabel,
  ListItemSubLabel,
} from "@/components/shared/ListComponents";
import { PageTitle } from "@/components/Typography";
import { PORTFOLIO } from "@/data/portfolio";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Newsletter",
  description: "Contact + places to follow Dalton Feldhut’s work.",
  path: "/newsletter",
});

export default function NewsletterPage() {
  return (
    <div data-scrollable className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:py-16">
        <header className="flex flex-col gap-2">
          <PageTitle className="text-accent-newsletter">Newsletter</PageTitle>
          <p className="text-secondary max-w-2xl leading-relaxed">
            No complicated signup flow here yet — just the places to follow the work, and the best
            way to reach me.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <section className="border-secondary rounded-xl border bg-white p-6 dark:bg-black">
            <h2 className="text-accent-newsletter font-serif text-xl font-semibold">
              Get in touch
            </h2>
            <p className="text-secondary mt-2 leading-relaxed">
              Email is best for opportunities, press, or collaboration.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`mailto:${PORTFOLIO.person.email}`}
                className="text-primary inline-flex items-center gap-2 underline underline-offset-4"
              >
                <Mail size={18} />
                {PORTFOLIO.person.email}
              </Link>
              <div className="text-secondary font-mono text-sm">{PORTFOLIO.person.phone}</div>
            </div>
          </section>

          <section className="border-secondary rounded-xl border bg-white p-6 dark:bg-black">
            <h2 className="text-accent-newsletter font-serif text-xl font-semibold">Follow</h2>
            <p className="text-secondary mt-2 leading-relaxed">
              Latest posts, videos, and updates.
            </p>

            <List className="mt-4 gap-3 sm:gap-3">
              <ListItem href={PORTFOLIO.links.website}>
                <ListItemLabel className="text-lg">The Bum Diary</ListItemLabel>
                <ListItemSubLabel className="font-mono text-sm">Website</ListItemSubLabel>
              </ListItem>
              <ListItem href={PORTFOLIO.links.instagram}>
                <Instagram size={18} className="text-primary" />
                <ListItemLabel className="text-lg">Instagram</ListItemLabel>
                <ListItemSubLabel className="font-mono text-sm">@bumdiarydotcom</ListItemSubLabel>
              </ListItem>
              <ListItem href={PORTFOLIO.links.youtube}>
                <YouTubeIcon
                  size={22}
                  className="text-primary"
                  playIconClassName="fill-[var(--background-color-elevated)]"
                />
                <ListItemLabel className="text-lg">YouTube</ListItemLabel>
                <ListItemSubLabel className="font-mono text-sm">Video feature</ListItemSubLabel>
              </ListItem>
            </List>
          </section>
        </div>
      </div>
    </div>
  );
}
