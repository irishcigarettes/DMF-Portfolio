"use client";

import { motion } from "motion/react";

import { InstagramPhotosSection } from "@/components/home/InstagramPhotosSection";
import {
  List,
  ListItem,
  ListItemLabel,
  ListItemSubLabel,
  Section,
  SectionHeading,
} from "@/components/shared/ListComponents";

export function HomeClient() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <motion.div
          className="text-primary mx-auto flex max-w-2xl flex-1 flex-col gap-16 py-16 leading-[1.6] sm:py-32"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* Vintage Hero Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.975 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.05, type: "spring", stiffness: 70 }}
          >
            <Section>
              <motion.h1
                id="home-title"
                className="mb-2 font-serif text-3xl font-semibold text-[var(--text-color-primary)]"
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.15 }}
              >
                DALTON MONROE FELDHUT
              </motion.h1>
              <p className="font-mono text-base text-[var(--text-color-tertiary)]">
                Los Angeles, CA &middot; dfeldhut@ucla.edu &middot; (951) 663-8529
              </p>
              <p className="text-secondary mt-6 max-w-prose font-serif text-lg">
                Creative communication and marketing professional with experience in press strategy,
                storytelling, multimedia production, and brand development. Skilled in crafting
                compelling narratives, producing high-quality content, and engaging audiences across
                digital platforms.
              </p>
              <p className="mt-2 font-sans text-sm text-[var(--text-color-quaternary)]">
                Website:{" "}
                <a
                  href="https://thebumdiary.com"
                  target="_blank"
                  rel="noopener"
                  className="underline"
                >
                  thebumdiary.com
                </a>
              </p>
              <div className="mt-3 flex gap-3">
                <ListItem href="https://www.instagram.com/bumdiarydotcom" className="group p-2">
                  <span className="font-sans text-base transition-transform group-hover:scale-105">
                    Instagram
                  </span>
                </ListItem>
                <ListItem href="mailto:dfeldhut@ucla.edu" className="group p-2">
                  <span className="font-sans text-base transition-transform group-hover:scale-105">
                    Email
                  </span>
                </ListItem>
              </div>
            </Section>
          </motion.div>

          {/* Projects and Portfolio Section */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            viewport={{ once: true, amount: 0.33 }}
          >
            <Section>
              <SectionHeading>Portfolio</SectionHeading>
              <List>
                <ListItemLabel className="mb-3 font-serif text-lg">The Bum Diary</ListItemLabel>
                <motion.div whileHover={{ scale: 1.04 }} className="w-full">
                  <ListItem href="https://thebumdiary.com" className="flex-col items-start gap-1">
                    <ListItemSubLabel>
                      Co-Creator & Managing Editor — A humor-driven storytelling project built
                      between New York and Los Angeles. Managed web, editorial, and social strategy;
                      developed a distinct comedic voice and grew the audience from scratch.
                    </ListItemSubLabel>
                  </ListItem>
                </motion.div>

                <ListItemLabel className="mt-5 mb-3 font-serif text-lg">
                  Recent Writing
                </ListItemLabel>
                {writingLinks.map((item) => (
                  <motion.div key={item.title} whileHover={{ scale: 1.04 }} className="w-full">
                    <ListItem href={item.url} className="flex-col items-start gap-1">
                      <ListItemLabel className="text-base underline">{item.title}</ListItemLabel>
                      <ListItemSubLabel>{item.desc}</ListItemSubLabel>
                    </ListItem>
                  </motion.div>
                ))}

                <ListItemLabel className="mt-5 mb-3 font-serif text-lg">
                  Video & Social Media
                </ListItemLabel>
                {videoLinks.map((item) => (
                  <motion.div key={item.title} whileHover={{ scale: 1.04 }} className="w-full">
                    <ListItem href={item.url} className="flex-col items-start gap-1">
                      <ListItemLabel className="text-base underline">{item.title}</ListItemLabel>
                      <ListItemSubLabel>{item.desc}</ListItemSubLabel>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </Section>
          </motion.div>

          <InstagramPhotosSection limit={12} />

          {/* Experience Section */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.17 }}
            viewport={{ once: true, amount: 0.33 }}
          >
            <Section>
              <SectionHeading>Experience</SectionHeading>
              <List>
                {experience.map((exp) => (
                  <motion.div key={exp.org} whileHover={{ scale: 1.03 }} className="w-full">
                    <ListItem className="flex-col items-start gap-1">
                      <ListItemLabel className="font-serif text-base">{exp.org}</ListItemLabel>
                      <ListItemSubLabel className="text-sm text-[var(--text-color-primary)]">
                        {exp.role} &middot; {exp.place} &middot;{" "}
                        <span className="font-mono">{exp.time}</span>
                      </ListItemSubLabel>
                      <ListItemSubLabel className="text-sm">{exp.desc}</ListItemSubLabel>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </Section>
          </motion.div>

          {/* Education Section */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.14 }}
            viewport={{ once: true, amount: 0.33 }}
          >
            <Section>
              <SectionHeading>Education</SectionHeading>
              <List>
                <ListItemLabel className="font-serif text-base">
                  UCLA — B.A. Communication
                </ListItemLabel>
                <ListItemSubLabel>Graduated Spring 2024 | GPA: 3.8</ListItemSubLabel>
              </List>
            </Section>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true, amount: 0.33 }}
          >
            <Section>
              <SectionHeading>Skills</SectionHeading>
              <List>
                <ListItemLabel className="font-sans text-base">
                  Marketing strategy, Content writing, Press releases, Interviews, Multimedia
                  production, Social campaigns, Adobe Creative Suite, Communication, Project
                  coordination
                </ListItemLabel>
              </List>
            </Section>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

const writingLinks = [
  {
    title: "Chick Habit",
    url: "https://thebumdiary.com/stories/chick-habit",
    desc: "Humor/creative writing",
  },
  {
    title: "Love Exists in Hunter, NY",
    url: "https://thebumdiary.com/stories/love-exists-in-hunter-ny",
    desc: "Essay",
  },
  {
    title: "I have a bone to pick with Susan from Spectrum",
    url: "https://thebumdiary.com/columns/i-have-a-bone-to-pick-with-susan-from-spectrum",
    desc: "Short column",
  },
  {
    title: "Dear Bum Diary Pt. 2",
    url: "https://thebumdiary.com/columns/dear-bum-diary-part-2",
    desc: "Satirical advice",
  },
  {
    title: "Dear Bum Diary Pt. 4",
    url: "https://thebumdiary.com/columns/dear-bum-diary-part-4",
    desc: "Satirical advice",
  },
];

const videoLinks = [
  {
    title: "Unleashed and Let Loose… The Extravagant Queer Madness of the Modern Furry",
    url: "https://youtu.be/vDx-mfHzyF4?si=CE8I58E7dSfUw6DX",
    desc: "Video feature",
  },
  {
    title: "Instagram: bumdiarydotcom",
    url: "https://www.instagram.com/bumdiarydotcom",
    desc: "Social highlights & video",
  },
  {
    title: "Queer Zoomer Internet",
    url: "https://www.instagram.com/reel/DO7eLrxkevW/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    desc: "Instagram Reel",
  },
  {
    title: "Instagram Reel",
    url: "https://www.instagram.com/reel/DOt_KMukm4G/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    desc: "Instagram Reel",
  },
  {
    title: "Instagram Reel",
    url: "https://www.instagram.com/reel/DK-P77BSZ_q/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    desc: "Instagram Reel",
  },
  {
    title: "Instagram Reel",
    url: "https://www.instagram.com/reel/DIwTh3KJjeF/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    desc: "Instagram Reel",
  },
  {
    title: "Instagram Reel",
    url: "https://www.instagram.com/reel/DGOczLMSfEa/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    desc: "Instagram Reel",
  },
  {
    title: "Instagram Reel",
    url: "https://www.instagram.com/reel/DFVn08JSGmY/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    desc: "Instagram Reel",
  },
];

const experience = [
  {
    org: "Cherry Pop Records",
    role: "Press Lead",
    place: "Los Angeles, CA",
    time: "Sep 2023 – Jun 2024",
    desc: "Produced press releases, interviewed artists, led editorial strategy.",
  },
  {
    org: "Daily Bruin",
    role: "Production Assistant",
    place: "Los Angeles, CA",
    time: "Sep 2021 – Jun 2024",
    desc: "Coordinated logistics for shoots, supported technical setup, and produced content.",
  },
  {
    org: "CreatorDAO",
    role: "Marketing Intern",
    place: "Los Angeles, CA",
    time: "Nov 2022 – Jan 2023",
    desc: "Helped run Creator Challenge, organized campus events.",
  },
  {
    org: "Geneva Co",
    role: "Team Leader",
    place: "Los Angeles, CA",
    time: "Jun 2024 – Aug 2024",
    desc: "Acquired new customers, managed events, and trained team reps.",
  },
  {
    org: "TheBumDiary.com",
    role: "Co-Creator & Editor",
    place: "NY & LA (Remote)",
    time: "2024–Present",
    desc: "Manages brand, writing, and growth for The Bum Diary.",
  },
];
