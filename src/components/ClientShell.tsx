"use client";

import { PropsWithChildren, useEffect } from "react";
import { Toaster } from "sonner";

import { CommandMenu } from "@/components/CommandMenu";
import { MobileNavMenu } from "@/components/MobileNavMenu";

import { GlobalTopBar } from "./GlobalTopBar";

export function ClientShell({ children }: PropsWithChildren) {
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches) return;

    let rafId: number | null = null;
    let activeEl: HTMLElement | null = null;
    let lastEvent: PointerEvent | null = null;

    const reset = (el: HTMLElement) => {
      el.style.setProperty("--magnetic-x", "0px");
      el.style.setProperty("--magnetic-y", "0px");
    };

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    const update = () => {
      rafId = null;
      if (!lastEvent) return;

      const target = lastEvent.target as HTMLElement | null;
      const candidate =
        (target?.closest?.(
          '[data-magnetic="true"], a:not([data-no-magnetic])',
        ) as HTMLElement | null) ?? null;

      const hasExplicitMagnetic = candidate?.getAttribute("data-magnetic") === "true";
      const hasText = (candidate?.textContent ?? "").trim().length > 0;
      const el = candidate && (hasExplicitMagnetic || hasText) ? candidate : null;

      if (el !== activeEl) {
        if (activeEl) reset(activeEl);
        activeEl = el;
      }

      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const nx = rect.width ? (lastEvent.clientX - cx) / (rect.width / 2) : 0;
      const ny = rect.height ? (lastEvent.clientY - cy) / (rect.height / 2) : 0;

      const strength = Number(el.getAttribute("data-magnetic-strength") ?? "2");
      const x = clamp(nx, -1, 1) * strength;
      const y = clamp(ny, -1, 1) * strength;

      el.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
      el.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
    };

    const onPointerMove = (e: PointerEvent) => {
      lastEvent = e;
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(update);
    };

    const onPointerOut = (e: PointerEvent) => {
      if (!activeEl) return;
      const related = e.relatedTarget as Node | null;
      if (related && activeEl.contains(related)) return;
      reset(activeEl);
      activeEl = null;
    };

    const onBlur = () => {
      if (!activeEl) return;
      reset(activeEl);
      activeEl = null;
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("blur", onBlur);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <>
      <Toaster position="bottom-center" />
      <CommandMenu />
      <MobileNavMenu />
      <GlobalTopBar />
      <main data-main-content className="relative isolate mx-auto flex min-h-svh w-full min-w-0">
        {children}
      </main>
    </>
  );
}
