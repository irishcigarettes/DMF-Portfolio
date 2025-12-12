import type { Metadata } from "next";

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
  title: "Stories",
  description: "Selected stories and longer-form writing by Dalton Feldhut.",
  path: "/stories",
});

export default function StoriesPage() {
  const written = PORTFOLIO.stories.filter((item) => item.category === "written");
  const edited = PORTFOLIO.stories.filter((item) => item.category === "edited");

  return (
    <div data-scrollable className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:py-16">
        <header className="flex flex-col gap-2">
          <PageTitle className="text-accent-stories">Stories</PageTitle>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-accent-stories font-serif text-2xl font-semibold">Written</h2>
          <List className="gap-3 sm:gap-2">
            {written.map((item) => (
              <ListItem key={item.href} href={item.href} className="items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <ListItemLabel className="line-clamp-none font-serif text-xl">
                    {item.title}
                  </ListItemLabel>
                  {item.description && <ListItemSubLabel>{item.description}</ListItemSubLabel>}
                </div>
                <span className="text-quaternary hidden font-mono text-sm md:inline">Read</span>
              </ListItem>
            ))}
          </List>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-accent-stories font-serif text-2xl font-semibold">
            Edited/Contributions
          </h2>
          <List className="gap-3 sm:gap-2">
            {edited.map((item) => (
              <ListItem key={item.href} href={item.href} className="items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <ListItemLabel className="line-clamp-none font-serif text-xl">
                    {item.title}
                  </ListItemLabel>
                  {item.description && <ListItemSubLabel>{item.description}</ListItemSubLabel>}
                </div>
                <span className="text-quaternary hidden font-mono text-sm md:inline">Read</span>
              </ListItem>
            ))}
          </List>
        </section>
      </div>
    </div>
  );
}
