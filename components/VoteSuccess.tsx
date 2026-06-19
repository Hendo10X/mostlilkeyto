"use client";

import { useEffect, useRef } from "react";

/**
 * transitions-dev #10 — success check. Briefly celebrates a recorded vote:
 * the check fades in, rotates upright, bobs, and draws its stroke.
 */
export function VoteSuccess({ show }: { show: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!show || !ref.current) return;
    const el = ref.current;
    el.setAttribute("data-state", "out");
    void el.offsetWidth; // force reflow so keyframes restart
    el.setAttribute("data-state", "in");
  }, [show]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <span
        ref={ref}
        className="t-success-check rounded-full bg-card/80 p-5 backdrop-blur-sm"
        data-state="out"
        aria-hidden="true"
      >
        <svg width="80" height="80" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="21" stroke="var(--primary)" strokeWidth="2.5" opacity="0.35" />
          <path
            d="M14 24.5l6.5 6.5L34 17"
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
