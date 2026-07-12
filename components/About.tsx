import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { site } from "@/lib/site";

const highlights = [
  "Detailed, transparent quotes — no surprise costs",
  "Punctual, uniformed, background-checked crews",
  "Premium materials and durable, long-lasting coatings",
  "Job sites left spotless, every single day",
] as const;

/** Two-column about block: photo collage + why-choose-us copy. */
export default function About() {
  return (
    <section id="about" className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Image collage */}
        <div className="relative">
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
        </div>

        {/* Copy */}
        <div className="lg:pl-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-dark">
            About {site.name}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Craftsmanship You Can Trust, Service You Can Count On
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {site.name} was built on a simple idea: treat every property —
            commercial or residential — with the same care we&apos;d give our
            own. That means honest estimates, meticulous prep work, and
            finishes that stand up to daily life.
          </p>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
