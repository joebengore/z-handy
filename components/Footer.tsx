import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { navLinks, site } from "@/lib/site";

/** Site footer: brand, quick links, contact snippets, and areas served. */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="#top" className="inline-block">
              <Image
                src="/images/logo_large_white.svg"
                alt={`${site.name} logo`}
                width={450}
                height={120}
                className="w-auto"
                style={{ height: '120px' }}
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              {site.tagline}. Licensed, insured, and committed to quality on
              every job.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-accent">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact snippets */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={site.phoneHref} className="flex items-center gap-2 hover:text-accent">
                  <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-accent">
                  <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                {site.serviceArea}
              </li>
            </ul>
          </div>

          {/* Areas served */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Areas Served
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {site.areasServed.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
