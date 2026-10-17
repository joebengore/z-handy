import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms of Service | ${site.name}`,
  description: `Terms governing use of the ${site.name} website and the estimates, quotes, and guarantees described on it.`,
};

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold text-slate-900">{children}</h2>
);

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 17, 2026">
      <p>
        These terms govern your use of z-handy.com (the &ldquo;Site&rdquo;), operated by Z-Handyman LLC (&ldquo;{site.name},&rdquo;
        &ldquo;we,&rdquo; &ldquo;us&rdquo;). By using the Site you agree to these terms. If you do not agree, please do not use the
        Site.
      </p>

      <H>Website use</H>
      <p>
        The Site provides general information about our services and lets you contact us or request a free estimate. You agree
        to use the Site lawfully, to provide accurate information, and not to interfere with its operation or attempt to access
        non-public areas without authorization.
      </p>

      <H>Estimates and quotes</H>
      <ul className="list-disc space-y-2 pl-6">
        <li>Information on the Site, including pricing examples and service descriptions, is for general information only and is
          not an offer or a guarantee of price or availability.</li>
        <li>A free estimate is a preliminary assessment. A written quote becomes binding only when both parties sign a work
          agreement, which will contain the full terms for that project.</li>
        <li>Quotes are valid for the period stated on them (typically 30 days) and may change if site conditions, scope, or
          material costs differ from what was assessed.</li>
      </ul>

      <H>Price Match Guarantee and warranties</H>
      <p>
        Our Price Match Guarantee and workmanship warranty are described on the{" "}
        <Link href="/#services" className="text-brand hover:underline">Services</Link> section of the Site and in your work
        agreement. Where the two differ, the signed work agreement controls. Warranty coverage, exclusions, and claim procedures
        are set out in the work agreement for each project.
      </p>

      <H>Scheduling and communications</H>
      <p>
        By submitting the contact form or booking an estimate, you consent to be contacted by phone, text message, or email
        about your request. Message and data rates may apply. You can ask us to stop contacting you at any time.
      </p>

      <H>Intellectual property</H>
      <p>
        The Site&rsquo;s text, images, logos, and design are owned by or licensed to Z-Handyman LLC and may not be copied or used
        without our written permission, except for personal, non-commercial viewing.
      </p>

      <H>Third-party services</H>
      <p>
        The Site uses third-party tools such as Cal.com for scheduling. Those services are governed by their own terms and
        privacy policies, and we are not responsible for their content or practices.
      </p>

      <H>Disclaimer and limitation of liability</H>
      <p>
        The Site is provided &ldquo;as is&rdquo; without warranties of any kind regarding its availability or accuracy. To the
        fullest extent permitted by law, Z-Handyman LLC is not liable for any indirect, incidental, or consequential damages
        arising from use of the Site. Nothing in these terms limits liabilities that cannot be limited under Florida law or any
        obligations in a signed work agreement.
      </p>

      <H>Governing law</H>
      <p>
        These terms are governed by the laws of the State of Florida. Any dispute relating to the Site will be brought in the
        state or federal courts located in Pinellas County, Florida.
      </p>

      <H>Changes</H>
      <p>
        We may update these terms at any time by posting a revised version with a new &ldquo;Last updated&rdquo; date. Your
        continued use of the Site means you accept the revised terms.
      </p>

      <H>Contact</H>
      <p>
        Questions about these terms? See our <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>{" "}
        or contact us at <a href={`mailto:${site.email}`} className="text-brand hover:underline">{site.email}</a> ·{" "}
        <a href={site.phoneHref} className="text-brand hover:underline">{site.phone}</a>.
      </p>
    </LegalPage>
  );
}
