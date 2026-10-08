"use client";

import { useEffect, useState } from "react";

/**
 * The one pause control (WCAG 2.2.2): toggles `paused` on <html>, which freezes every CSS loop.
 * Scroll-driven scenes only move when the visitor scrolls, so they need no pausing.
 * The boot script restores the state from sessionStorage ("ls-paused") before paint.
 * Hidden without JS, under reduced motion and on the static fallback (.ls-toggle in motion.css).
 */
export default function MotionToggle({ className = "" }: { className?: string }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setPaused(document.documentElement.classList.contains("paused"));
  }, []);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    document.documentElement.classList.toggle("paused", next);
    try {
      sessionStorage.setItem("ls-paused", next ? "1" : "0");
    } catch {
      /* storage blocked: the class still works for this visit */
    }
  };

  return (
    <button type="button" className={`ls-toggle ${className}`.trim()} aria-pressed={paused} onClick={toggle}>
      {paused ? "Pornește mișcarea" : "Pauză mișcare"}
    </button>
  );
}
