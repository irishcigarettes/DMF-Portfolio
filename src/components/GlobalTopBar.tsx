"use client";

import { useAtom } from "jotai";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

import { sidebarAtom } from "@/atoms/sidebar";
import { Instagram } from "@/components/icons/Instagram";
import { Mail } from "@/components/icons/Mail";
import { YouTubeIcon } from "@/components/icons/SocialIcons";
import { navigationItems } from "@/config/navigation";
import { PORTFOLIO } from "@/data/portfolio";
import { cn } from "@/lib/utils";

import { MenuToggle } from "./icons/MenuToggle";
import { TopBarActionsSlot } from "./TopBarActions";
import { IconButton } from "./ui/IconButton";

/**
 * Checks if an element is visible (not hidden via CSS)
 */
function isElementVisible(element: HTMLElement): boolean {
  const style = getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

/**
 * Finds the appropriate scroll target based on the current page layout.
 * Prioritizes:
 * 1. Element with data-scroll-priority="true" (set by list-detail layouts based on current view)
 * 2. Any visible [data-scrollable] container
 * 3. Any visible scrollable element with overflow-y-auto
 * 4. Falls back to window scroll
 */
function findScrollTarget(): HTMLElement | null {
  const mainContent = document.querySelector("[data-main-content]") as HTMLElement;
  if (!mainContent) return null;

  // First check for element with scroll priority (set by list-detail layouts)
  const priorityContainer = mainContent.querySelector(
    '[data-scroll-priority="true"]',
  ) as HTMLElement;
  if (priorityContainer && isElementVisible(priorityContainer)) {
    return priorityContainer;
  }

  // Look for any visible scrollable container with data-scrollable
  const scrollableContainers = mainContent.querySelectorAll(
    "[data-scrollable]",
  ) as NodeListOf<HTMLElement>;

  for (const container of scrollableContainers) {
    if (isElementVisible(container) && container.scrollHeight > container.clientHeight) {
      return container;
    }
  }

  // Fallback: find any scrollable element with overflow-y-auto
  const allScrollable = mainContent.querySelectorAll(
    '[class*="overflow-y-auto"], [class*="overflow-auto"]',
  ) as NodeListOf<HTMLElement>;

  for (const container of allScrollable) {
    if (isElementVisible(container) && container.scrollHeight > container.clientHeight) {
      return container;
    }
  }

  return null;
}

export function BreadcrumbDivider() {
  return <div className="text-quaternary font-medium opacity-50 dark:opacity-70">/</div>;
}

export function BreadcrumbLabel({ href, children }: { href?: string; children: React.ReactNode }) {
  if (href) {
    return (
      <Link
        href={href}
        className="text-primary rounded-md p-2 font-medium hover:bg-black/[0.04] active:bg-black/[0.06] dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]"
        data-magnetic="true"
        data-magnetic-strength="2"
      >
        {children}
      </Link>
    );
  }
  return <span className="text-primary p-2 font-medium">{children}</span>;
}

export function GlobalTopBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useAtom(sidebarAtom);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Check if click target is or is inside a button or link
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }

    const scrollTarget = findScrollTarget();
    if (scrollTarget) {
      scrollTarget.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const mainNavItems = useMemo(() => navigationItems.filter((item) => item.section === "main"), []);

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "border-secondary sticky top-0 z-30 flex h-14 w-full items-center border-b bg-white/90 px-3 backdrop-blur dark:bg-black/80",
        )}
      >
        <IconButton
          className="rounded-full md:hidden"
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <MenuToggle isOpen={isOpen} />
        </IconButton>

        <Link
          href="/"
          className="text-primary font-serif text-lg font-semibold tracking-tight transition-opacity select-none hover:opacity-90"
          data-magnetic="true"
          data-magnetic-strength="2"
        >
          DALTON FELDHUT
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {mainNavItems
            .filter((item) => item.href !== "/")
            .map((item) => {
              const isActive = item.isActive?.(pathname) ?? false;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "text-secondary decoration-quaternary hover:text-primary font-medium tracking-wide uppercase transition-colors hover:underline hover:underline-offset-4",
                    isActive && "text-primary underline underline-offset-4",
                  )}
                  data-magnetic="true"
                  data-magnetic-strength="2"
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <a
            href={PORTFOLIO.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary rounded-md p-2 hover:bg-black/[0.04] active:bg-black/[0.06] dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]"
            data-no-magnetic="true"
            aria-label="Instagram"
          >
            <Instagram size={20} />
          </a>
          <a
            href={PORTFOLIO.links.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary rounded-md p-2 hover:bg-black/[0.04] active:bg-black/[0.06] dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]"
            data-no-magnetic="true"
            aria-label="YouTube"
          >
            <YouTubeIcon
              size={22}
              className="text-current"
              playIconClassName="fill-[var(--background-color-elevated)]"
            />
          </a>
          <a
            href={`mailto:${PORTFOLIO.person.email}`}
            className="text-secondary hover:text-primary rounded-md p-2 hover:bg-black/[0.04] active:bg-black/[0.06] dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]"
            data-no-magnetic="true"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
          <TopBarActionsSlot />
        </div>
      </div>
    </>
  );
}
