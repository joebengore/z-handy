"use client";

import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { CalendarDays } from "lucide-react";
import { site } from "@/lib/site";

/**
 * Inline Cal.com scheduler wrapped in a Tailwind loading skeleton.
 * The skeleton renders instantly (keeping LCP fast) and fades out
 * once the embed script reports the booking UI is ready.
 */
export default function Scheduler() {
  const [calReady, setCalReady] = useState(false);

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: site.cal.namespace });

      // Match the embed to the site's brand palette.
      cal("ui", {
        theme: "light",
        layout: "month_view",
        cssVarsPerTheme: {
          light: { "cal-brand": "#1e3a8a" },
          dark: { "cal-brand": "#f59e0b" },
        },
        hideEventTypeDetails: false,
      });

      // Swap the skeleton out as soon as the booking link renders.
      cal("on", {
        action: "linkReady",
        callback: () => setCalReady(true),
      });
    })();
  }, []);

  return (
    <section id="schedule" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-dark">
            Online Scheduling
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Book Your Free Estimate
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Pick a date and time that works for you — we&apos;ll confirm your
            appointment instantly. No phone tag required.
          </p>
        </div>

        {/* Scheduler card */}
        <div className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-brand px-6 py-4">
            <CalendarDays className="h-5 w-5 text-accent" aria-hidden="true" />
            <p className="text-sm font-semibold text-white">
              {site.name} · Free 30-Minute Estimate
            </p>
          </div>

          <div className="relative min-h-[640px]">
            {/* Loading skeleton — visible until Cal.com signals linkReady */}
            {!calReady && (
              <div
                className="absolute inset-0 z-10 animate-pulse space-y-6 bg-white p-8"
                aria-hidden="true"
              >
                <div className="h-8 w-1/3 rounded-lg bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
                <div className="grid grid-cols-7 gap-3 pt-4">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-slate-100" />
                  ))}
                </div>
              </div>
            )}

            <Cal
              namespace={site.cal.namespace}
              calLink={site.cal.link}
              config={{ layout: "month_view", theme: "light" }}
              style={{ width: "100%", height: "100%", minHeight: "640px" }}
              className={calReady ? "opacity-100 transition-opacity duration-500" : "opacity-0"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
