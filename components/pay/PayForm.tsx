"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Lock, ShieldCheck } from "lucide-react";
import PaymentFieldsForm from "@/components/pay/PaymentFieldsForm";
import { Button, ErrorNotice, apiJson } from "@/components/admin/ui";
import { emptyPaymentFields, paymentFieldsFromParams, validatePayment, type PaymentFields } from "@/lib/payments";
import { site } from "@/lib/site";

const DRAFT_KEY = "zh-pay-draft";

export default function PayForm() {
  const params = useSearchParams();
  const canceled = params.get("canceled") === "1";
  const [fields, setFields] = useState<PaymentFields>(emptyPaymentFields);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  // Prefill from the URL; after a canceled checkout, restore what the customer had typed instead.
  useEffect(() => {
    let initial = paymentFieldsFromParams(params);
    if (canceled) {
      try {
        const saved = sessionStorage.getItem(DRAFT_KEY);
        if (saved) initial = { ...initial, ...(JSON.parse(saved) as Partial<PaymentFields>) };
      } catch {
        /* ignore */
      }
    }
    setFields(initial);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const check = validatePayment(fields);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setBusy(true);
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(fields));
      const { url } = await apiJson<{ url: string }>(
        await fetch("/api/pay/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        }),
      );
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  if (!ready) return <div className="h-96" aria-hidden="true" />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {canceled && (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Your payment was canceled and nothing was charged. Your details are still filled in below if you&apos;d like to try again.
        </p>
      )}

      <PaymentFieldsForm value={fields} onChange={setFields} disabled={busy} />

      <ErrorNotice message={error} />

      <Button type="submit" loading={busy} className="w-full py-3 text-base">
        <Lock className="h-4 w-4" aria-hidden="true" />
        Continue to secure payment
      </Button>

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <span>
          Payments are processed securely by Stripe. We never see or store your card details. A receipt is emailed to you
          automatically. Questions? Call{" "}
          <a href={site.phoneHref} className="font-medium text-brand hover:underline">
            {site.phone}
          </a>
          .
        </span>
      </p>
    </form>
  );
}
