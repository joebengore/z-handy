import { ShieldCheck, Building2, ThumbsUp } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "Fully Licensed & Insured",
    subtitle: "Complete peace of mind on every job",
  },
  {
    icon: Building2,
    title: "Commercial & Residential",
    subtitle: "Equipped for projects of any scale",
  },
  {
    icon: ThumbsUp,
    title: "Satisfaction Guaranteed",
    subtitle: "We aren't done until you're happy",
  },
] as const;

/** Slim full-width trust banner directly below the hero. */
export default function TrustBadges() {
  return (
    <section className="bg-brand-dark" aria-label="Why customers trust us">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
        {badges.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-4 px-2 py-6 sm:justify-center">
            <Icon className="h-8 w-8 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-slate-300">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
