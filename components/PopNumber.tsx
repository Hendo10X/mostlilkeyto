"use client";

import { useEffect, useRef } from "react";

/**
 * transitions-dev #2 — number pop-in. Each character re-enters with a
 * blurred slide whenever `value` changes; the last two characters stagger.
 */
export function PopNumber({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const groupRef = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    const group = groupRef.current;
    if (!group) return;
    group.classList.remove("is-animating");
    void group.offsetHeight; // force reflow so the keyframes replay
    group.classList.add("is-animating");
  }, [value]);

  const chars = `${value}${suffix}`.split("");

  return (
    <span
      ref={groupRef}
      className={`t-digit-group is-animating tabular-nums ${className ?? ""}`}
    >
      {chars.map((ch, i) => {
        const stagger =
          i === chars.length - 2 ? 1 : i === chars.length - 1 ? 2 : undefined;
        return (
          <span key={i} className="t-digit" data-stagger={stagger}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}
