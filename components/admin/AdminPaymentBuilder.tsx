"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import PaymentLinkBuilder from "@/components/pay/PaymentLinkBuilder";
import { apiJson } from "@/components/admin/ui";
import type { Job, JobSummary } from "@/lib/jobs";
import { formatCents, type PaymentFields } from "@/lib/payments";

interface LoadedJob {
  jobNumber: string;
  name: string;
  totalCents: number | null;
}

/**
 * Admin variant of the link builder. Typing a known job number into the
 * job/invoice field loads that job's sheet and fills in the customer details,
 * the same way the job editor does.
 */
export default function AdminPaymentBuilder({ jobs, jobsError }: { jobs: JobSummary[]; jobsError: string | null }) {
  const [patch, setPatch] = useState<Partial<PaymentFields> | undefined>();
  const [loading, setLoading] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typedRef, setTypedRef] = useState("");
  const lastLookup = useRef("");

  const byNumber = useMemo(() => new Map(jobs.map((j) => [j.jobNumber, j])), [jobs]);

  const refOptions = useMemo(
    () =>
      jobs.map((j) => ({
        value: j.jobNumber,
        label: [j.customerName, j.jobAddress].filter(Boolean).join(" · "),
      })),
    [jobs],
  );

  const onFieldsChange = useCallback((fields: PaymentFields) => setTypedRef(fields.ref.trim()), []);

  useEffect(() => {
    const match = byNumber.get(typedRef);
    if (!match || typedRef === lastLookup.current) return;
    lastLookup.current = typedRef;

    let cancelled = false;
    setLoading(typedRef);
    setError(null);
    fetch(`/api/admin/jobs/${match.id}`, { cache: "no-store" })
      .then((res) => apiJson<{ job: Job }>(res))
      .then(({ job }) => {
        if (cancelled) return;
        setPatch({ name: job.details.name, email: job.details.email, address: job.details.jobAddress });
        const total = job.total ?? job.subtotal;
        setLoaded({ jobNumber: job.jobNumber, name: job.details.name, totalCents: total !== null ? Math.round(total * 100) : null });
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not load that job.");
        lastLookup.current = "";
      })
      .finally(() => {
        if (!cancelled) setLoading(null);
      });
    return () => {
      cancelled = true;
    };
  }, [typedRef, byNumber]);

  const showLoaded = loaded !== null && loaded.jobNumber === typedRef;
  const setAmount = (cents: number) => setPatch({ amount: (Math.round(cents) / 100).toFixed(2).replace(/\.00$/, "") });

  const refHint = (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Loading job {loading}…
        </>
      ) : showLoaded ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          <span className="text-emerald-700">
            Loaded {loaded.jobNumber}
            {loaded.name ? ` · ${loaded.name}` : ""}
            {loaded.totalCents !== null ? ` · quote ${formatCents(loaded.totalCents)}` : ""}
          </span>
          {loaded.totalCents !== null && loaded.totalCents > 0 && (
            <>
              <button type="button" onClick={() => setAmount(loaded.totalCents!)} className="font-medium text-brand hover:underline">
                Use total
              </button>
              <button type="button" onClick={() => setAmount(loaded.totalCents! / 2)} className="font-medium text-brand hover:underline">
                50% deposit
              </button>
            </>
          )}
        </>
      ) : error ? (
        <span className="text-red-700">{error}</span>
      ) : jobsError ? (
        <span className="text-amber-700">Job lookup unavailable: {jobsError}</span>
      ) : (
        "Type a job number (e.g. 261001) to fill in the customer automatically, or any invoice reference."
      )}
    </span>
  );

  return (
    <PaymentLinkBuilder
      patch={patch}
      onFieldsChange={onFieldsChange}
      refOptions={jobs.length ? refOptions : undefined}
      refHint={refHint}
    />
  );
}
