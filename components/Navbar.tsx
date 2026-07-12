"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, CalendarCheck } from "lucide-react";
import { navLinks, site } from "@/lib/site";

/**
 * Sticky top navigation. Transparent-to-solid is intentionally avoided in
 * favor of an always-solid white bar for maximum readability/trust.
 * Collapses into an animated hamburger drawer on mobile.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex h-32 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="#top" className="flex items-center gap-2" onClick={closeMenu}>
          <Image
            src="/images/logo-wide-blue.svg"
            alt={`${site.name} logo`}
            width={420}
            height={108}
            priority
            className="w-auto"
            style={{ height: '108px' }}
          />
          <span className="sr-only">{site.name}</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-brand"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <a
          href="#schedule"
          className="hidden items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark md:inline-flex"
        >
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Book Online
        </a>

        {/* Mobile hamburger toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <ul className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-brand"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="#schedule"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-accent-dark"
              >
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                Book Online
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
