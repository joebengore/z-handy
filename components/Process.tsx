import { Footprints, FileText, PaintRoller, ShieldCheck } from "lucide-react";
import Reveal from "@/components/Reveal";

const steps = [
  {
    icon: Footprints,
    title: "Walk & Scope",
    copy: "We walk your property with you, document every surface, and answer questions on the spot. Free, no obligation.",
  },
  {
    icon: FileText,
    title: "Itemized Quote",
    copy: "You get a written, line-item quote — prep, coats, products, timeline. Have a competing bid? We'll match a qualified quote.",
  },
  {
    icon: PaintRoller,
    title: "Prep & Paint",
    copy: "Meticulous surface prep and premium coatings, scheduled nights and weekends so your business never loses a day.",
  },
  {
    icon: ShieldCheck,
    title: "Walkthrough & Warranty",
    copy: "We tour the finished job with you, resolve the punch list, and back every square foot for three full years.",
  },
] as const;

/** Four-step "how it works" strip with staggered scroll reveals. */
export default function Process() {
  return (
    <section id="process" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-dark">
            How It Works
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From First Walkthrough to Final Coat
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A documented, no-surprises process on every project — commercial or
            residential.
          </p>
        </Reveal>

        <ol className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line (desktop only) */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-brand/10 via-brand/30 to-brand/10 lg:block"
          />
          {steps.map(({ icon: Icon, title, copy }, i) => (
            <li key={title}>
              <Reveal delay={i * 140} className="relative flex flex-col items-center text-center">
                <span className="relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white shadow-lg ring-8 ring-white">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <span className="mt-4 text-xs font-bold uppercase tracking-widest text-accent-dark">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">{copy}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
