import React from "react";

import { Badge } from "@/components/icons/Badge";
import { Blockquote } from "@/components/icons/Blockquote";
import { BookOpen } from "@/components/icons/BookOpen";
import { Home } from "@/components/icons/Home";
import { Newspaper } from "@/components/icons/Newspaper";
import { IconProps } from "@/components/icons/types";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<IconProps>;
  keywords?: string[];
  isActive?: (pathname: string) => boolean;
  section?: "main" | "projects";
}

export const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: Home,
    keywords: ["home", "dashboard"],
    isActive: (pathname) => pathname === "/",
    section: "main",
  },
  {
    id: "stories",
    label: "Stories",
    href: "/stories",
    icon: BookOpen,
    keywords: ["stories", "writing", "longform"],
    isActive: (pathname) => pathname.startsWith("/stories"),
    section: "main",
  },
  {
    id: "columns",
    label: "Columns",
    href: "/columns",
    icon: Blockquote,
    keywords: ["columns", "opinion", "short"],
    isActive: (pathname) => pathname.startsWith("/columns"),
    section: "main",
  },
  {
    id: "magazine",
    label: "Magazine",
    href: "/magazine",
    icon: Newspaper,
    keywords: ["magazine", "print"],
    isActive: (pathname) => pathname.startsWith("/magazine"),
    section: "main",
  },
  {
    id: "resume",
    label: "Resume",
    href: "/resume",
    icon: Badge,
    keywords: ["resume", "cv", "experience"],
    isActive: (pathname) => pathname.startsWith("/resume"),
    section: "main",
  },
];

// Helper functions to filter navigation items
export const getMainNavigationItems = () =>
  navigationItems.filter((item) => item.section === "main");

export const getProjectNavigationItems = () =>
  navigationItems.filter((item) => item.section === "projects");

export const getAllNavigationItems = () => navigationItems;
