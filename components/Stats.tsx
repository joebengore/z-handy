"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

const stats = [
  { value: 3, suffix: "-Year", label: "Workmanship Warranty on every paint job" },
  { value: 100, suffix: "%", label: "Price Match on any qualified written quote" },
  { value: 5, suffix: "+", label: "Cities served across the Tampa Bay metro" },
  { value: 7, suffix: " Days", label: "A week — nights & weekends, zero downtime" },
] as const;

/** Animates a number from 0 to its target once the band scrolls into view. */
function CountUp({ target, suffix, start }: { target: number; suffix: string; start: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    const duration = 1400;
    let frame: number;
    const begin = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - begin) / duration, 1);
      // Ease-out cubic for a satisfying deceleration.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target]);

  return (
    <span className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
      {value}
      <span className="text-accent">{suffix}</span>
    </span>
  );
}

/** Full-width dark stat band with scroll-triggered count-up numbers. */
export default function Stats() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-label={`${site.name} by the numbers`}
      className="relative isolate overflow-hidden bg-brand-dark py-16 sm:py-20"
    >
      {/* Decorative diagonal accent stripes */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, #fff 0, #fff 2px, transparent 2px, transparent 24px)",
        }}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map(({ value, suffix, label }) => (
          <div key={label} className="text-center">
            <CountUp target={value} suffix={suffix} start={inView} />
            <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-snug text-slate-300">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
