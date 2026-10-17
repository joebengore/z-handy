import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${site.name}`,
  description: `How ${site.name} collects, uses, and protects information from website visitors and customers.`,
};

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold text-slate-900">{children}</h2>
);

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 17, 2026">
      <p>
        Z-Handyman LLC (&ldquo;{site.name},&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) operates z-handy.com. This policy explains
        what information we collect, how we use it, and the choices you have. By using our website or services you agree to
        this policy.
      </p>

      <H>Information we collect</H>
      <p>We collect only what we need to respond to you and perform the work you request:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>Contact details</strong> you send through our contact form or scheduling tool, such as your name, email
          address, phone number, and message.
        </li>
        <li>
          <strong>Job information</strong> you provide when requesting an estimate or hiring us, such as the property address,
          mailing address, approximate square footage, and the scope of work.
        </li>
        <li>
          <strong>Technical information</strong> collected automatically by our hosting provider, such as IP address, browser
          type, and pages visited, used for security and to keep the site running.
        </li>
      </ul>
      <p>We do not knowingly collect information from children under 13.</p>

      <H>How we use information</H>
      <ul className="list-disc space-y-2 pl-6">
        <li>To reply to inquiries and schedule estimates.</li>
        <li>To prepare quotes, contracts, and invoices, and to perform and warrant the work.</li>
        <li>To communicate about your project by phone, text, or email.</li>
        <li>To maintain business records as required by law and for accounting, insurance, and tax purposes.</li>
        <li>To protect the security of our website and business.</li>
      </ul>
      <p>We do not sell, rent, or trade your personal information, and we do not use it for third-party advertising.</p>

      <H>Service providers</H>
      <p>We use a small number of third-party services to run the website and the business. They process information only on
        our behalf and under their own privacy policies:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li><strong>Vercel</strong> — website hosting.</li>
        <li><strong>Web3Forms</strong> — delivers contact-form submissions to our email inbox.</li>
        <li><strong>Cal.com</strong> — appointment scheduling for free estimates.</li>
        <li>
          <strong>Google Workspace services (Google Drive, Google Sheets, Google Docs)</strong> — we store customer job records,
          quotes, and contracts in our own Google account. Our internal administrative tools access only our own Google Drive
          and Sheets data; they never access our customers&rsquo; or visitors&rsquo; Google accounts.
        </li>
      </ul>

      <H>How long we keep information</H>
      <p>
        Inquiry messages are kept as long as needed to respond and follow up. Job records, quotes, and contracts are retained
        for as long as required for warranty, accounting, legal, and insurance purposes, after which they are deleted or
        anonymized.
      </p>

      <H>Security</H>
      <p>
        We use reasonable administrative and technical safeguards, including encrypted connections (HTTPS), password-protected
        internal tools, and access limited to authorized personnel and subcontractors who need it to perform work. No method of
        transmission or storage is completely secure, so we cannot guarantee absolute security.
      </p>

      <H>Your choices</H>
      <ul className="list-disc space-y-2 pl-6">
        <li>You may ask us to access, correct, or delete the personal information we hold about you.</li>
        <li>You may opt out of non-essential communications at any time by telling us.</li>
        <li>You may decline to provide information, though we may then be unable to provide an estimate or perform work.</li>
      </ul>
      <p>To make a request, contact us using the details below. We will respond within 30 days.</p>

      <H>Changes to this policy</H>
      <p>
        We may update this policy from time to time. The &ldquo;Last updated&rdquo; date above shows when it was last revised.
        Continued use of the website after a change means you accept the updated policy.
      </p>

      <H>Contact us</H>
      <p>
        Z-Handyman LLC
        <br />
        2850 34th St N., Suite 105, St. Petersburg, FL 33713
        <br />
        <a href={`mailto:${site.email}`} className="text-brand hover:underline">{site.email}</a> ·{" "}
        <a href={site.phoneHref} className="text-brand hover:underline">{site.phone}</a>
      </p>
    </LegalPage>
  );
}
