"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Phone, Mail, Clock, MapPin, Send, CheckCircle2 } from "lucide-react";
import { site } from "@/lib/site";
import Reveal from "@/components/Reveal";

interface FormData {
  name: string;
  email: string;
  message: string;
}

const initialForm: FormData = { name: "", email: "", message: "" };

/** Two-column contact block: business info + controlled message form. */
export default function ContactSection() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: Wire up to an API route (e.g. POST /api/contact) or a form
    // service. The payload is ready to send as-is:
    // await fetch("/api/contact", { method: "POST", body: JSON.stringify(form) });

    setSubmitted(true);
    setForm(initialForm);
  };

  const infoItems = [
    { icon: Phone, label: "Phone", value: site.phone, href: site.phoneHref },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: Clock, label: "Business Hours", value: site.hours },
    { icon: MapPin, label: "Service Area", value: site.serviceArea },
  ] as const;

  return (
    <section id="contact" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-dark">
            Get In Touch
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Questions? We&apos;re Here to Help
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Prefer to talk it through first? Reach out any way you like.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {/* Column 1 — contact info */}
          <div className="rounded-2xl bg-brand-dark p-8 text-white sm:p-10">
            <h3 className="text-2xl font-semibold">Contact Information</h3>
            <p className="mt-2 text-slate-300">
              Fast responses during business hours — usually within the hour.
            </p>
            <ul className="mt-8 space-y-6">
              {infoItems.map(({ icon: Icon, label, value, ...rest }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    {"href" in rest && rest.href ? (
                      <a href={rest.href} className="text-lg font-medium hover:text-accent">
                        {value}
                      </a>
                    ) : (
                      <p className="text-lg font-medium">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-white/10 pt-6">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Areas Served
              </p>
              <p className="mt-2 text-slate-200">{site.areasServed.join(" · ")}</p>
            </div>
          </div>

          {/* Column 2 — message form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <CheckCircle2 className="h-14 w-14 text-accent" aria-hidden="true" />
                <h3 className="text-2xl font-semibold text-slate-900">Message Sent!</h3>
                <p className="max-w-sm text-slate-600">
                  Thanks for reaching out — we&apos;ll get back to you shortly.
                  Need something sooner? Give us a call at{" "}
                  <a href={site.phoneHref} className="font-semibold text-brand hover:underline">
                    {site.phone}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-sm font-semibold text-brand hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Tell us about your project…"
                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark sm:w-auto"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
