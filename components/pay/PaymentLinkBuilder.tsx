"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, MessageSquare, RotateCcw } from "lucide-react";
import PaymentFieldsForm from "@/components/pay/PaymentFieldsForm";
import { Button } from "@/components/admin/ui";
import { buildPayUrl, dollarsToCents, emptyPaymentFields, formatCents, paymentTypeLabel, type PaymentFields } from "@/lib/payments";

/**
 * Builds a prefilled /pay link. Purely client-side: nothing is charged or stored.
 * `patch` lets a parent push values in (e.g. the admin page after loading a job);
 * `onFieldsChange` lets it watch what's typed.
 */
export default function PaymentLinkBuilder({
  patch,
  onFieldsChange,
  refOptions,
  refHint,
  children,
}: {
  patch?: Partial<PaymentFields>;
  onFieldsChange?: (fields: PaymentFields) => void;
  refOptions?: { value: string; label: string }[];
  refHint?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [fields, setFields] = useState<PaymentFields>({ ...emptyPaymentFields, ...patch });
  const [origin, setOrigin] = useState("https://z-handy.com");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (patch) setFields((prev) => ({ ...prev, ...patch }));
  }, [patch]);

  useEffect(() => {
    onFieldsChange?.(fields);
  }, [fields, onFieldsChange]);

  const url = useMemo(() => buildPayUrl(origin, fields), [origin, fields]);
  const cents = dollarsToCents(fields.amount);
  const hasSomething = Object.values(fields).some((v) => v.trim());

  const smsBody = useMemo(() => {
    const what = fields.type ? paymentTypeLabel(fields.type).toLowerCase() : "payment";
    const amount = cents ? ` of ${formatCents(cents)}` : "";
    const who = fields.name ? `Hi ${fields.name.split(" ")[0]}, ` : "";
    return `${who}here's your secure link to make your ${what}${amount} to Z-Handyman: ${url}`;
  }, [fields, cents, url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div className="space-y-6">
      {children}
      <PaymentFieldsForm value={fields} onChange={setFields} mode="link" refOptions={refOptions} refHint={refHint} />

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment link</p>
        <p className="mt-2 break-all font-mono text-sm text-slate-800">{url}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={copy}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
          <a
            href={`sms:?&body=${encodeURIComponent(smsBody)}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" /> Text it
          </a>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Preview
          </a>
          {hasSomething && (
            <Button type="button" variant="ghost" onClick={() => setFields(emptyPaymentFields)}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear
            </Button>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Everything is editable by the customer. Leave fields blank to let them fill those in.
        </p>
      </div>
    </div>
  );
}
