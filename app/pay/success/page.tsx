import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import type Stripe from "stripe";
import LegalPage from "@/components/LegalPage";
import { formatCents, isPaymentType, paymentTypeLabel } from "@/lib/payments";
import { stripe } from "@/lib/stripe";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Payment Received | ${site.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PaySuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;

  let session: Stripe.Checkout.Session | null = null;
  let loadError = false;
  if (session_id && /^cs_(test|live)_[A-Za-z0-9]+$/.test(session_id)) {
    try {
      session = await stripe().checkout.sessions.retrieve(session_id);
    } catch (error) {
      console.error("pay/success: could not retrieve session", error instanceof Error ? error.message : error);
      loadError = true;
    }
  } else {
    loadError = true;
  }

  const meta = session?.metadata ?? {};
  const type = isPaymentType(meta.payment_type) ? paymentTypeLabel(meta.payment_type) : null;
  const paid = session?.payment_status === "paid";
  const processing = session && !paid && session.status === "complete"; // e.g. ACH debit still clearing
  const email = session?.customer_details?.email ?? session?.customer_email ?? null;

  return (
    <LegalPage title={paid ? "Thank you!" : processing ? "Payment submitted" : "Payment status"}>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {loadError || !session ? (
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <p className="font-medium text-slate-900">We couldn&apos;t look up this payment.</p>
              <p className="mt-1 text-sm text-slate-600">
                If you completed checkout, your card was charged and Stripe has emailed you a receipt. If you&apos;re unsure,
                call us at{" "}
                <a href={site.phoneHref} className="font-medium text-brand hover:underline">
                  {site.phone}
                </a>
                .
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              {paid ? (
                <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" aria-hidden="true" />
              ) : (
                <Clock className="mt-0.5 h-7 w-7 shrink-0 text-amber-600" aria-hidden="true" />
              )}
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {paid ? "Thank you — your payment was received." : "Your payment is being processed."}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {paid
                    ? `A receipt has been emailed to ${email ?? "you"}.`
                    : `Bank payments can take a few business days to clear. Stripe will email ${email ?? "you"} when it's complete.`}
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-x-8 gap-y-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
              <Row label="Amount" value={session.amount_total !== null ? formatCents(session.amount_total) : "—"} />
              <Row label="Payment type" value={type ?? "Payment"} />
              {meta.ref && <Row label="Job / invoice number" value={meta.ref} />}
              {meta.job_address && <Row label="Job address" value={meta.job_address} />}
              {meta.note && <Row label="For" value={meta.note} />}
              {meta.customer_name && <Row label="Paid by" value={meta.customer_name} />}
            </dl>
          </>
        )}
      </div>

      <p className="text-sm text-slate-500">
        <Link href="/" className="font-medium text-brand hover:underline">
          Back to {site.name}
        </Link>
      </p>
    </LegalPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{value}</dd>
    </div>
  );
}
