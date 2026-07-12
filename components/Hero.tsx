import Image from "next/image";
import { Phone, CalendarCheck } from "lucide-react";
import { site } from "@/lib/site";

/**
 * Full-bleed hero with a darkened background photo, headline,
 * and the two primary conversion paths: Call Now + Book Free Estimate.
 */
export default function Hero() {
  return (
    <section id="top" className="relative isolate flex min-h-[85vh] items-center">
      {/* Background image + brand-tinted overlay for text contrast */}
      <Image
        src="/images/hero.jpg"
        alt="Professional painter working on a commercial property"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-dark/90 via-brand-dark/75 to-brand/50" />

      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium tracking-wide text-amber-300 ring-1 ring-white/20">
            Serving the {site.serviceArea}
          </p>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Commercial &amp; Residential Painting,{" "}
            <span className="text-accent">Done Right.</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-200 sm:text-xl">
            From office buildings and retail spaces to flawless home finishes and
            expert property maintenance — {site.name} delivers professional
            results on time and on budget.
          </p>

          {/* Primary CTAs */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={site.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg transition-colors hover:bg-accent-dark"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call Now · {site.phone}
            </a>
            <a
              href="#schedule"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/70 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-dark"
            >
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              Book Free Estimate
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
