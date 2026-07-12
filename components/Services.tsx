import {
  Building2,
  Home,
  Paintbrush,
  TreePine,
  Wrench,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Service {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
}

const services: Service[] = [
  {
    icon: Building2,
    title: "Commercial Painting",
    subtitle: "Offices · Retail · Corporate Exteriors",
    description:
      "Minimal-disruption painting for office buildings, retail spaces, and exterior corporate properties. Scheduled around your business hours with clean, professional crews.",
  },
  {
    icon: Home,
    title: "Residential Painting",
    subtitle: "Premium Home Improvements",
    description:
      "Elevate your home with flawless finishes. We treat every residence like our own — careful prep, crisp lines, and premium paints that last for years.",
  },
  {
    icon: Paintbrush,
    title: "Interior & Exterior Painting",
    subtitle: "Prep · Masking · Durable Coatings",
    description:
      "Comprehensive surface preparation, professional masking, and durable coatings engineered for Florida sun and humidity — inside and out.",
  },
  {
    icon: TreePine,
    title: "Yard & Lawn Care",
    subtitle: "Cleanup · Landscaping · Routine Service",
    description:
      "Seasonal cleanup, landscaping maintenance, and dependable routine lawn service that keeps your property looking sharp all year round.",
  },
  {
    icon: Wrench,
    title: "General Handyman Services",
    subtitle: "Repairs · Installations · Maintenance",
    description:
      "Drywall repair, fixture installation, and general property maintenance. One trusted call for the entire to-do list — big or small.",
  },
];

/** Responsive grid of service cards with icons, subtitles, and descriptions. */
export default function Services() {
  return (
    <section id="services" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-dark">
            What We Do
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Professional Services, One Trusted Team
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Painting specialists first, property-care experts always. Every job
            is backed by our satisfaction guarantee.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, subtitle, description }) => (
            <article
              key={title}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
            >
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm font-medium text-accent-dark">{subtitle}</p>
              <p className="mt-3 flex-1 leading-relaxed text-slate-600">{description}</p>
            </article>
          ))}

          {/* CTA card completes the 2x3 grid on desktop */}
          <article className="flex flex-col justify-center rounded-2xl bg-brand p-8 text-white shadow-sm">
            <h3 className="text-xl font-semibold">Not sure where to start?</h3>
            <p className="mt-3 leading-relaxed text-slate-200">
              Every project begins with a free, no-obligation estimate. Pick a
              time that works for you and we&apos;ll handle the rest.
            </p>
            <a
              href="#schedule"
              className="mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              Get a Free Estimate
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
