"use client";

import { useEffect, useRef } from "react";

const CLICK_SOUND_STORAGE_KEY = "mac-click-sounds";

function isSoundEnabled(): boolean {
  try {
    const stored = window.localStorage.getItem(CLICK_SOUND_STORAGE_KEY);
    if (!stored) return true;
    return stored !== "off";
  } catch {
    return true;
  }
}

function isTextInputTarget(target: HTMLElement): boolean {
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], [contenteditable=''], [role='textbox']",
    ),
  );
}

function isInteractiveTarget(target: HTMLElement): boolean {
  return Boolean(
    target.closest(
      "a, button, summary, label, [role='button'], [role='menuitem'], [data-click-sound='true']",
    ),
  );
}

type AudioContextCtor = new () => AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function playMacOsxClick(ctx: AudioContext) {
  const t0 = ctx.currentTime;

  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.exponentialRampToValueAtTime(0.11, t0 + 0.002);
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(600, t0);

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(6500, t0);

  out.connect(hp);
  hp.connect(lp);
  lp.connect(ctx.destination);

  // Tonal component (crisp, UI-like)
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(1900, t0);
  osc.frequency.exponentialRampToValueAtTime(1200, t0 + 0.014);
  osc.connect(out);

  // Noise component (tiny "tick")
  const noiseLen = Math.floor(ctx.sampleRate * 0.02);
  const noiseBuffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseLen; i += 1) {
    // Slight tilt towards the start to feel more "clicky"
    const decay = 1 - i / noiseLen;
    data[i] = (Math.random() * 2 - 1) * 0.3 * decay;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, t0);
  noiseGain.gain.exponentialRampToValueAtTime(0.055, t0 + 0.0015);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.018);

  noise.connect(noiseGain);
  noiseGain.connect(out);

  osc.start(t0);
  osc.stop(t0 + 0.03);

  noise.start(t0);
  noise.stop(t0 + 0.02);

  const cleanup = () => {
    try {
      osc.disconnect();
    } catch {
      // ignore
    }
    try {
      noise.disconnect();
    } catch {
      // ignore
    }
    try {
      noiseGain.disconnect();
    } catch {
      // ignore
    }
    try {
      out.disconnect();
    } catch {
      // ignore
    }
    try {
      hp.disconnect();
    } catch {
      // ignore
    }
    try {
      lp.disconnect();
    } catch {
      // ignore
    }
  };

  osc.addEventListener("ended", cleanup, { once: true });
}

export function MacClickSounds() {
  const ctxRef = useRef<AudioContext | null>(null);
  const lastPlayAtRef = useRef<number>(0);
  const enabledRef = useRef<boolean>(true);

  useEffect(() => {
    enabledRef.current = isSoundEnabled();
  }, []);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!enabledRef.current) return;
      if (document.visibilityState !== "visible") return;

      // Avoid right/middle click
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (isTextInputTarget(target)) return;
      if (!isInteractiveTarget(target)) return;

      // Light throttle (prevents double-fire on some devices)
      const now = performance.now();
      if (now - lastPlayAtRef.current < 35) return;
      lastPlayAtRef.current = now;

      const Ctor = getAudioContextCtor();
      if (!Ctor) return;

      if (!ctxRef.current) ctxRef.current = new Ctor();
      const ctx = ctxRef.current;

      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      playMacOsxClick(ctx);
    };

    document.addEventListener("pointerdown", onPointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      const ctx = ctxRef.current;
      ctxRef.current = null;
      if (ctx) {
        void ctx.close();
      }
    };
  }, []);

  return null;
}
