"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const hiddenTransforms: Record<Direction, string> = {
  up: "translate-y-10",
  down: "-translate-y-10",
  left: "translate-x-10",
  right: "-translate-x-10",
  none: "scale-[0.97]",
};

/**
 * Scroll-triggered reveal wrapper. Children start hidden/offset and
 * animate into place the first time they enter the viewport.
 * Respects prefers-reduced-motion (renders instantly).
 */
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  direction?: Direction;
  /** Transition delay in milliseconds — use to stagger sibling cards. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -48px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible
          ? "translate-x-0 translate-y-0 scale-100 opacity-100"
          : `opacity-0 ${hiddenTransforms[direction]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
