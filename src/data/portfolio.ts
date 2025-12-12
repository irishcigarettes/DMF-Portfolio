export type PortfolioLink = {
  title: string;
  href: string;
  description?: string;
  date?: string;
};

export type StoryLink = PortfolioLink & {
  category: "written" | "edited";
};

export type ColumnLink = PortfolioLink & {
  category: "written" | "edited";
};

export type ResumeExperience = {
  org: string;
  role: string;
  location: string;
  dates: string;
  bullets: string[];
};

export const PORTFOLIO = {
  person: {
    name: "Dalton Feldhut",
    location: "Los Angeles, CA",
    email: "dfeldhut@ucla.edu",
    phone: "(951) 663-8529",
  },
  summary:
    "Creative communication and marketing professional with experience in press strategy, storytelling, multimedia production, and brand development. Skilled in crafting compelling narratives, producing high-quality content, and engaging audiences across digital platforms. Brings a strong balance of creativity, strategic thinking, and hands-on production experience developed through roles in music, media, and marketing.",
  education: {
    school: "UCLA",
    degree: "B.A. Communication",
    details: "Graduated Spring 2024 | GPA: 3.8",
  },
  links: {
    website: "https://thebumdiary.com",
    instagram:
      "https://www.instagram.com/bumdiarydotcom?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    youtube: "https://youtu.be/vDx-mfHzyF4?si=CE8I58E7dSfUw6DX",
  },
  stories: [
    {
      title: "Chick Habit",
      href: "https://thebumdiary.com/stories/chick-habit",
      description: "Humor/creative writing (Bum Diary story).",
      category: "written",
    },
    {
      title: "Love Exists in Hunter, NY",
      href: "https://thebumdiary.com/stories/love-exists-in-hunter-ny",
      description: "Essay (Bum Diary story).",
      category: "written",
    },
    {
      title: "Unleashed and Let Loose: The New Age of Furry",
      href: "https://thebumdiary.com/stories/unleashed-and-let-loose-the-new-age-of-furry",
      description: "Edited/contributed (Bum Diary story).",
      category: "edited",
    },
    {
      title: "There's No Party Like an I.E. Party",
      href: "https://thebumdiary.com/stories/there-s-no-party-like-an-i-e-party",
      description: "Edited/contributed (Bum Diary story).",
      category: "edited",
    },
    {
      title: "Blue Heaven",
      href: "https://thebumdiary.com/stories/blue-heaven",
      description: "Edited/contributed (Bum Diary story).",
      category: "edited",
    },
    {
      title: "The Great Big Mess",
      href: "https://thebumdiary.com/stories/the-great-big-mess",
      description: "Edited/contributed (Bum Diary story).",
      category: "edited",
    },
  ] satisfies StoryLink[],
  columns: [
    {
      title: "I Have a Bone to Pick With Susan From Spectrum",
      href: "https://thebumdiary.com/columns/i-have-a-bone-to-pick-with-susan-from-spectrum",
      description: "Column (Bones to Pick).",
      category: "written",
    },
    {
      title: "Dear Bum Diary... Part 2",
      href: "https://thebumdiary.com/columns/dear-bum-diary-part-2",
      description: "Column (Dear Bum Diary).",
      category: "written",
    },
    {
      title: "Dear Bum Diary... Part 3",
      href: "https://thebumdiary.com/columns/dear-bum-diary-part-3",
      description: "Column (Dear Bum Diary).",
      category: "edited",
    },
    {
      title: "Dear Bum Diary... Part 4",
      href: "https://thebumdiary.com/columns/dear-bum-diary-part-4",
      description: "Column (Dear Bum Diary).",
      category: "written",
    },
    {
      title: "Dear Bum Diary... Part 5",
      href: "https://thebumdiary.com/columns/dear-bum-diary-part-5",
      description: "Column (Dear Bum Diary).",
      category: "edited",
    },
    {
      title: "Dear Bum Diary... Hello World",
      href: "https://thebumdiary.com/columns/dear-bum-diary-hello-world",
      description: "Column (Dear Bum Diary).",
      category: "edited",
    },
  ] satisfies ColumnLink[],
  videos: [
    {
      title: "Unleashed and Let Loose… The Extravagant Queer Madness of the Modern Furry",
      href: "https://youtu.be/vDx-mfHzyF4?si=CE8I58E7dSfUw6DX",
      description: "Video feature (YouTube).",
    },
    {
      title: "The Bum Diary Instagram Profile",
      href: "https://www.instagram.com/bumdiarydotcom?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      description: "Instagram profile + highlights.",
    },
    {
      title: "Instagram Reel",
      href: "https://www.instagram.com/reel/DO7eLrxkevW/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      description: "Instagram Reel.",
    },
    {
      title: "Instagram Reel",
      href: "https://www.instagram.com/reel/DOt_KMukm4G/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      description: "Instagram Reel.",
    },
    {
      title: "Instagram Reel",
      href: "https://www.instagram.com/reel/DK-P77BSZ_q/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      description: "Instagram Reel.",
    },
    {
      title: "Instagram Reel",
      href: "https://www.instagram.com/reel/DIwTh3KJjeF/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      description: "Instagram Reel.",
    },
    {
      title: "Instagram Reel",
      href: "https://www.instagram.com/reel/DGOczLMSfEa/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      description: "Instagram Reel.",
    },
    {
      title: "Instagram Reel",
      href: "https://www.instagram.com/reel/DFVn08JSGmY/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      description: "Instagram Reel.",
    },
  ] satisfies PortfolioLink[],
  experience: [
    {
      org: "TheBumDiary.com",
      role: "Co-Creator & Managing Editor",
      location: "New York, NY & Los Angeles, CA",
      dates: "2024–Present",
      bullets: [
        "Co-created and manage a humor-driven storytelling project based between New York and Los Angeles.",
        "Built and grew a social media following to 500+ highly engaged followers within the first year through consistent posting and narrative-driven content.",
        "Serve as managing editor overseeing writing quality, editorial direction, and content calendar.",
        "Developed a distinct brand voice through comedic writing, character development, and creative narrative structure.",
        "Manage web updates, layout decisions, social media strategy, and overall content direction for the platform.",
      ],
    },
    {
      org: "Cherry Pop Records",
      role: "Press Lead",
      location: "Los Angeles, CA",
      dates: "Sep 2023 – Jun 2024",
      bullets: [
        "Produced press releases and EPKs for emerging artists, strengthening brand presence across digital platforms.",
        "Conducted interviews with local and industry-recognized artists, generating compelling written and multimedia content.",
        "Collaborated with a team of writers to refine the label’s editorial voice and promotional strategy.",
      ],
    },
    {
      org: "Daily Bruin",
      role: "Production Assistant",
      location: "Los Angeles, CA",
      dates: "Sep 2021 – Jun 2024",
      bullets: [
        "Coordinated logistics for in-studio and remote video/audio shoots.",
        "Supported technical setup, equipment operation, and content production.",
        "Contributed to audience growth by supporting development of multimedia content for social channels.",
      ],
    },
    {
      org: "CreatorDAO",
      role: "Marketing Intern",
      location: "Los Angeles, CA",
      dates: "Nov 2022 – Jan 2023",
      bullets: [
        "Helped run the Creator Challenge campaign to increase community engagement and content submissions.",
        "Organized campus-level promotional events and messaging for student audiences nationwide.",
      ],
    },
    {
      org: "Geneva Co",
      role: "Team Leader",
      location: "Los Angeles, CA",
      dates: "Jun 2024 – Aug 2024",
      bullets: [
        "Represented clients at events, consistently acquiring new customers and surpassing sales targets.",
        "Achieved top performance metrics in sales volume, account quality, and customer satisfaction.",
        "Managed event operations and trained new representatives to improve team close rates.",
      ],
    },
    {
      org: "Walgreens",
      role: "Seasonal Associate",
      location: "—",
      dates: "2023",
      bullets: [],
    },
    {
      org: "Converse",
      role: "Sales Representative",
      location: "—",
      dates: "2022",
      bullets: [],
    },
  ] satisfies ResumeExperience[],
  skills: [
    "Marketing strategy",
    "Content writing",
    "Press releases",
    "Interviews",
    "Multimedia production",
    "Social campaigns",
    "Adobe Creative Suite",
    "Communication",
    "Project coordination",
  ],
} as const;
