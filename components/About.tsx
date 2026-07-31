import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { site } from "@/lib/site";
import Reveal from "@/components/Reveal";

const highlights = [
  "Price Match Guarantee — we won't be beat by a qualified quote",
  "3-Year Workmanship Warranty on every commercial & residential paint job",
  "After-hours & weekend scheduling that keeps your business open",
  "Punctual, uniformed, background-checked crews — job sites left spotless",
] as const;

/** Two-column about block: photo collage + why-choose-us copy. */
export default function About() {
  return (
    <section id="about" className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Image collage */}
        <Reveal direction="right" className="relative">
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/images/interior.jpg"
              alt="Freshly painted interior with a flawless finish"
              width={720}
              height={520}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -right-4 hidden w-56 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:block lg:-right-8">
            <Image
              src="/images/general-handyman.jpg"
              alt="Handyman completing a property maintenance repair"
              width={448}
              height={320}
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>

        {/* Copy */}
        <Reveal direction="left" delay={120} className="lg:pl-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-dark">
            About {site.name}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Commercial-Grade Craftsmanship, Small-Team Accountability
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {site.name} was built on a simple idea: bring commercial-grade
            standards to every property we touch. That means honest, itemized
            estimates, meticulous prep work, and coatings engineered to stand
            up to daily wear — whether it&apos;s a 40,000 sq ft office park or
            your family home.
          </p>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
