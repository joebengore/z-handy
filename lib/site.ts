/**
 * Central business configuration for Z-Handyman.
 * Update phone/email/hours here and the change propagates
 * to the Navbar, Hero, Contact section, and Footer.
 */
export const site = {
  name: "Z-Handyman",
  tagline: "Tampa Bay's Commercial Painting Specialists",

  phone: "(813) 540-9095",
  phoneHref: "tel:+18135409095",
  email: "contact@z-handyman.com",

  hours: "Open Daily · 8:00 AM – 6:00 PM",
  serviceArea: "Greater Tampa Metro Area",
  areasServed: ["Tampa", "St. Petersburg", "Clearwater", "Brandon", "Wesley Chapel"],

  // Cal.com scheduling configuration (https://cal.com/zhandy/free-estimate)
  cal: {
    link: "zhandy/free-estimate",
    namespace: "30min",
  },
} as const;

/** Anchor links used by the Navbar and Footer for smooth-scroll navigation. */
export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Schedule", href: "#schedule" },
  { label: "Contact", href: "#contact" },
] as const;
