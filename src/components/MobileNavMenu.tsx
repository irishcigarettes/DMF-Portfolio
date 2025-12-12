"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { sidebarAtom } from "@/atoms/sidebar";
import { Instagram } from "@/components/icons/Instagram";
import { Mail } from "@/components/icons/Mail";
import { YouTubeIcon } from "@/components/icons/SocialIcons";
import { getMainNavigationItems, getProjectNavigationItems } from "@/config/navigation";
import { PORTFOLIO } from "@/data/portfolio";
import { cn } from "@/lib/utils";

export function MobileNavMenu() {
  const isOpen = useAtomValue(sidebarAtom);
  const setIsOpen = useSetAtom(sidebarAtom);
  const pathname = usePathname();

  const mainNavItems = React.useMemo(() => getMainNavigationItems(), []);
  const projectNavItems = React.useMemo(() => getProjectNavigationItems(), []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 top-11 z-20 flex origin-top flex-col bg-white dark:bg-black"
        >
          {/* Navigation - TopBar stays on top, menu opens below */}
          <nav className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-1">
              {mainNavItems.map((item) => (
                <MobileNavLink
                  key={item.id}
                  href={item.href}
                  isActive={item.isActive?.(pathname) ?? false}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </MobileNavLink>
              ))}
            </div>

            {projectNavItems.length > 0 && (
              <div className="mt-8">
                <span className="text-quaternary text-sm font-medium">Projects</span>
                <div className="mt-3 flex flex-col gap-1">
                  {projectNavItems.map((item) => (
                    <MobileNavLink
                      key={item.id}
                      href={item.href}
                      isActive={item.isActive?.(pathname) ?? false}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </MobileNavLink>
                  ))}
                </div>
              </div>
            )}

            {/* Social links */}
            <div className="mt-8 flex flex-row items-center gap-4">
              <Link
                href={PORTFOLIO.links.instagram}
                className="text-quaternary hover:text-primary -ml-2 rounded-md p-2 hover:bg-black/[0.04] active:bg-black/[0.06] dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]"
                data-no-magnetic="true"
                onClick={() => setIsOpen(false)}
              >
                <Instagram size={24} />
              </Link>
              <Link
                href={PORTFOLIO.links.youtube}
                className="group rounded-md p-2 hover:bg-black/[0.04] active:bg-black/[0.06] dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]"
                data-no-magnetic="true"
                onClick={() => setIsOpen(false)}
              >
                <YouTubeIcon
                  size={28}
                  className="text-quaternary group-hover:text-[#FF0302]"
                  playIconClassName="fill-[var(--background-color-elevated)] group-hover:fill-white"
                />
              </Link>
              <Link
                href={`mailto:${PORTFOLIO.person.email}`}
                className="text-quaternary hover:text-primary rounded-md p-2 hover:bg-black/[0.04] active:bg-black/[0.06] dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]"
                data-no-magnetic="true"
                onClick={() => setIsOpen(false)}
              >
                <Mail size={24} />
              </Link>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileNavLink({
  href,
  isActive,
  onClick,
  children,
}: {
  href: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} onClick={onClick} data-magnetic="true" data-magnetic-strength="2">
      <div
        className={cn("rounded-md px-2 py-2 text-xl font-semibold transition-colors", {
          "text-primary bg-black/[0.04] dark:bg-white/[0.06]": isActive,
          "text-tertiary hover:text-primary hover:bg-black/[0.04] active:bg-black/[0.06] dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]":
            !isActive,
        })}
      >
        {children}
      </div>
    </Link>
  );
}
