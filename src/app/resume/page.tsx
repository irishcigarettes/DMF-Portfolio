import type { Metadata } from "next";

import { PageTitle } from "@/components/Typography";
import { PORTFOLIO } from "@/data/portfolio";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Resume",
  description: "Resume for Dalton Feldhut (communication + marketing).",
  path: "/resume",
});

export default function ResumePage() {
  return (
    <div data-scrollable className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 md:py-16">
        <header className="flex flex-col gap-2">
          <PageTitle className="text-accent-resume">Resume</PageTitle>
          <div className="text-secondary flex flex-col gap-1 leading-relaxed">
            <div className="text-accent-crimson font-serif text-2xl font-semibold">
              {PORTFOLIO.person.name}
            </div>
            <div className="text-secondary">
              {PORTFOLIO.person.email} • {PORTFOLIO.person.phone} • {PORTFOLIO.person.location}
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-accent-resume font-serif text-xl font-semibold">Summary</h2>
          <p className="text-secondary leading-relaxed">{PORTFOLIO.summary}</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-accent-resume font-serif text-xl font-semibold">Education</h2>
          <div className="text-secondary leading-relaxed">
            <div className="text-primary font-medium">
              {PORTFOLIO.education.school} — {PORTFOLIO.education.degree}
            </div>
            <div className="text-quaternary">{PORTFOLIO.education.details}</div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-accent-resume font-serif text-xl font-semibold">Experience</h2>
          <div className="flex flex-col gap-6">
            {PORTFOLIO.experience.map((exp) => (
              <div
                key={`${exp.org}-${exp.role}-${exp.dates}`}
                className="border-secondary border-b pb-6"
              >
                <div className="flex flex-col gap-1">
                  <div className="text-primary font-serif text-lg font-semibold">{exp.org}</div>
                  <div className="text-secondary">
                    {exp.role} • {exp.location} • <span className="font-mono">{exp.dates}</span>
                  </div>
                </div>
                {exp.bullets.length > 0 && (
                  <ul className="text-secondary mt-3 list-disc space-y-1 pl-5">
                    {exp.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-accent-resume font-serif text-xl font-semibold">Skills</h2>
          <p className="text-secondary leading-relaxed">{PORTFOLIO.skills.join(" • ")}</p>
        </section>
      </div>
    </div>
  );
}
