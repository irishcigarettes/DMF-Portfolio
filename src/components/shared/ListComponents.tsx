import Link from "next/link";
import { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function Section({ children, className = "" }: PropsWithChildren & { className?: string }) {
  return <div className={cn("flex flex-col gap-4 px-4", className)}>{children}</div>;
}

export function SectionHeading({
  children,
  className = "",
}: PropsWithChildren & { className?: string }) {
  return (
    <div className={cn("text-quaternary dark:text-tertiary leading-[1.6] select-none", className)}>
      {children}
    </div>
  );
}

export function InlineLink({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="link-body"
      data-magnetic="true"
      data-magnetic-strength="3"
    >
      {children}
    </a>
  );
}

interface ListProps extends PropsWithChildren {
  className?: string;
}

interface ListItemProps extends PropsWithChildren {
  className?: string;
  href?: string;
}

interface ListItemLabelProps extends PropsWithChildren {
  className?: string;
  href?: string;
}

interface ListItemSubLabelProps extends PropsWithChildren {
  className?: string;
}

export function List({ children, className = "" }: ListProps) {
  return <ul className={cn("flex flex-col gap-4 sm:gap-1.5", className)}>{children}</ul>;
}

export function ListItem({ children, className = "", href }: ListItemProps) {
  const isLink = !!href;
  const elementClassName = cn(
    "inline-flex flex-1 items-center gap-2 rounded-md text-xl transition-colors",
    isLink &&
      "group/list-item cursor-pointer hover:bg-black/[0.04] active:bg-black/[0.06] dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]",
    className,
  );

  if (href) {
    const isExternal = href.startsWith("http");
    if (isExternal) {
      return (
        <li className="flex">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={elementClassName}
            data-magnetic="true"
            data-magnetic-strength="3"
          >
            {children}
          </a>
        </li>
      );
    }
    return (
      <li className="flex">
        <Link
          href={href}
          className={elementClassName}
          data-magnetic="true"
          data-magnetic-strength="3"
        >
          {children}
        </Link>
      </li>
    );
  }

  return (
    <li className="flex">
      <div className={elementClassName}>{children}</div>
    </li>
  );
}

export function ListItemLabel({ children, className = "" }: ListItemLabelProps) {
  return (
    <span
      className={cn(
        "text-primary decoration-quaternary line-clamp-1 leading-[1.6] font-medium underline-offset-1 transition-[color,text-decoration-color] duration-150 group-hover/list-item:underline",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ListItemSubLabel({ children, className = "" }: ListItemSubLabelProps) {
  return <span className={cn("text-quaternary leading-[1.6]", className)}>{children}</span>;
}
