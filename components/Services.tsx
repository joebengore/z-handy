import Image from "next/image";
import {
  Building2,
  Home,
  Shovel,
  Hammer,
  ArrowRight,
  BadgeDollarSign,
  ShieldCheck,
} from "lucide-react";
import Reveal from "@/components/Reveal";

/** Reusable guarantee chips shown on painting service cards. */
function GuaranteeChips() {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <a
        href="#price-match"
        className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-dark ring-1 ring-accent/40 transition-colors hover:bg-accent/20"
      >
        <BadgeDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
        Price Match Guarantee · See Details
      </a>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand/20">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        3-Year Workmanship Warranty
      </span>
    </div>
  );
}

/** Rebalanced service grid: commercial painting leads, followed by residential, landscape installation, and remodel work. */
export default function Services() {
  return (
    <section id="services" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-dark">
            What We Do
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Commercial Painting Specialists — And a Whole Lot More
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Commercial painting is our craft. Every paint job is backed by our
            Price Match Guarantee and a 3-Year Workmanship Warranty.
          </p>
        </Reveal>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Commercial Painting — flagship, full-width split panel */}
          <Reveal className="sm:col-span-2 lg:col-span-3">
            <article className="group h-full overflow-hidden rounded-2xl border-2 border-brand/20 bg-white shadow-md transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl">
            <div className="flex flex-col lg:flex-row">
              <div className="relative h-56 w-full sm:h-72 lg:h-auto lg:w-1/2">
                <Image
                  src="/images/commercial.jpg"
                  alt="Professional painter spray-coating the interior walls of a commercial warehouse"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  Our Flagship Service
                </span>
              </div>
              <div className="flex flex-1 flex-col p-8 lg:p-10">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand text-white">
                  <Building2 className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Commercial Painting</h3>
                <p className="mt-1 text-sm font-medium text-accent-dark">
                  Offices · Retail · Industrial · HOA & Multi-Family · Corporate Exteriors
                </p>
                <p className="mt-3 flex-1 leading-relaxed text-slate-600">
                  When your property is your brand, the finish matters. Our
                  crews deliver spec-perfect coatings for office buildings,
                  storefronts, warehouses, and multi-family communities — with
                  night, weekend, and phased scheduling that keeps your
                  operation running and your tenants undisturbed. Every project
                  is supervised, insured, and completed to a documented scope,
                  and we stand behind every square foot for three full years.
                </p>
                <GuaranteeChips />
              </div>
            </div>
            </article>
          </Reveal>

          {/* Residential Painting */}
          <Reveal delay={0}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg">
            <div className="relative h-40 w-full">
              <Image
                src="/images/interior.jpg"
                alt="Freshly painted, professionally finished home interior"
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-8 pt-6">
              <div className="mb-3 inline-flex items-center gap-2 text-brand">
                <Home className="h-5 w-5" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-slate-900">Residential Painting</h3>
              </div>
              <p className="text-sm font-medium text-accent-dark">Interior · Exterior · Premium Finishes</p>
              <p className="mt-3 flex-1 leading-relaxed text-slate-600">
                The same commercial-grade preparation, premium coatings, and
                crisp lines we bring to corporate campuses — delivered to your
                front door, on schedule and on budget.
              </p>
              <GuaranteeChips />
            </div>
            </article>
          </Reveal>

          {/* Lawn & Landscape Design */}
          <Reveal delay={140}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg">
            <div className="relative h-40 w-full">
              <Image
                src="/images/yard-services.jpg"
                alt="Professionally designed and installed landscaping"
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-8 pt-6">
              <div className="mb-3 inline-flex items-center gap-2 text-brand">
                <Shovel className="h-5 w-5" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-slate-900">Lawn & Landscape Design</h3>
              </div>
              <p className="text-sm font-medium text-accent-dark">Design · Installation · Transformation</p>
              <p className="mt-3 flex-1 leading-relaxed text-slate-600">
                From blank canvas to showstopper curb appeal. We design and
                install complete landscapes — plantings, sod, beds, and
                hardscape accents — built once, built right. (Installation
                specialists — we don&apos;t offer routine mowing or maintenance.)
              </p>
            </div>
            </article>
          </Reveal>

          {/* Remodel & Finish Work */}
          <Reveal delay={280}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg">
            <div className="relative h-40 w-full">
              <Image
                src="/images/general-handyman.jpg"
                alt="Craftsman installing interior trim during a remodel"
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-8 pt-6">
              <div className="mb-3 inline-flex items-center gap-2 text-brand">
                <Hammer className="h-5 w-5" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-slate-900">Remodel & Finish Work</h3>
              </div>
              <p className="text-sm font-medium text-accent-dark">Baseboards · Trim · Drywall</p>
              <p className="mt-3 flex-1 leading-relaxed text-slate-600">
                The details that finish a remodel: baseboard and trim
                installation, drywall hanging and repair, and the punch-list
                craftsmanship that turns “almost done” into done.
              </p>
            </div>
            </article>
          </Reveal>

          {/* Free estimate CTA — full-width banner */}
          <Reveal className="sm:col-span-2 lg:col-span-3">
            <article className="h-full overflow-hidden rounded-2xl bg-brand text-white shadow-md">
            <div className="flex flex-col lg:flex-row-reverse">
              <div className="relative h-56 w-full sm:h-64 lg:h-auto lg:w-2/5">
                <Image
                  src="/images/estimate.jpg"
                  alt="Z-Handyman estimator reviewing a project on-site with homeowners"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-brand/60 to-transparent lg:bg-gradient-to-r lg:from-brand lg:via-brand/20 lg:to-transparent"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center p-8 lg:p-10">
                <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                  Free On-Site Estimates
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  Straightforward pricing, right at your property
                </h3>
                <p className="mt-3 max-w-xl leading-relaxed text-slate-200">
                  We&apos;ll walk the site with you, document the scope, and
                  deliver a written, itemized quote — free and with no
                  obligation. Have a competing bid? Bring it along: if it
                  qualifies, we&apos;ll match it.
                </p>
                <a
                  href="#schedule"
                  className="mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
                >
                  Schedule Your Free Estimate
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
            </article>
          </Reveal>
        </div>

        {/* Price Match Guarantee — full terms */}
        <details
          id="price-match"
          className="mt-12 scroll-mt-32 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <summary className="flex cursor-pointer items-center gap-2 text-base font-semibold text-slate-900">
            <BadgeDollarSign className="h-5 w-5 text-accent-dark" aria-hidden="true" />
            Price Match Guarantee — Full Terms & Conditions
          </summary>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              Z-Handyman will match the price of a bona fide competitor quote for
              commercial or residential painting services, subject to all of the
              following terms and conditions:
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                The competing quote must be a formal, written, itemized proposal,
                dated within thirty (30) days of presentation, issued by a
                licensed and insured painting contractor regularly engaged in
                the commercial or residential painting trade within our service
                area.
              </li>
              <li>
                The quote must reflect an identical scope of work, including but
                not limited to: surface preparation, number of coats, paint
                brand and product line, warranty coverage, project timeline, and
                site conditions. Quotes reflecting lesser-grade materials,
                reduced preparation, or shorter warranty terms do not qualify.
              </li>
              <li>
                Z-Handyman reserves the right to verify the authenticity, scope,
                and pricing of any submitted quote directly with the issuing
                contractor prior to honoring a match.
              </li>
              <li>
                This guarantee does not apply to: quotes from unlicensed or
                uninsured operators; cash-only or off-the-books offers;
                promotional, loss-leader, or below-cost pricing; auction or bid
                platform pricing; quotes issued by any person or entity
                affiliated with the customer; or quotes that Z-Handyman
                reasonably believes to be fraudulent, altered, expired, or
                obtained in bad faith.
              </li>
              <li>
                Price matching may not be combined with any other offer,
                discount, or promotion, and applies to the contract price only
                — not to change orders or additional work.
              </li>
              <li>
                All determinations of eligibility are made at Z-Handyman&apos;s
                sole and absolute discretion. Z-Handyman reserves the right to
                decline any match request and to modify or discontinue this
                program at any time without notice. A matched price does not
                alter the terms of our standard service agreement.
              </li>
            </ol>
          </div>
        </details>
      </div>
    </section>
  );
}
