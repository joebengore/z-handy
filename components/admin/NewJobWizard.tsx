"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import type { JobDetails, JobSummary } from "@/lib/jobs";
import JobDetailsFields, { emptyDetails } from "@/components/admin/JobDetailsFields";
import ItemFields, { draftTotal, emptyItem, type ItemDraft } from "@/components/admin/ItemFields";
import { Button, ErrorNotice, apiJson, money } from "@/components/admin/ui";

const STORAGE_KEY = "zh-admin-new-job";

interface Draft {
  step: 1 | 2;
  details: JobDetails;
  items: ItemDraft[];
}

const initialDraft: Draft = { step: 1, details: emptyDetails, items: [] };

const isBlank = (d: ItemDraft) => !d.item.trim() && !d.materials.trim() && !d.labor.trim();

export default function NewJobWizard() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [current, setCurrent] = useState<ItemDraft>(emptyItem);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setDraft({ ...initialDraft, ...(JSON.parse(saved) as Partial<Draft>) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const update = (patch: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleDetailsNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    update({ step: 2 });
  };

  /** Validates the in-progress item and moves it into the list. Returns the new list or null if invalid. */
  const commitCurrent = (): ItemDraft[] | null => {
    if (isBlank(current)) return draft.items;
    if (!current.item.trim()) {
      setError("Give this item a description before continuing.");
      return null;
    }
    if (!current.materials.trim() && !current.labor.trim()) {
      setError("Enter Materials or Labor for this item.");
      return null;
    }
    const items = [...draft.items, current];
    update({ items });
    setCurrent(emptyItem);
    return items;
  };

  const handleAddAnother = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    commitCurrent();
  };

  const removeItem = (index: number) => update({ items: draft.items.filter((_, i) => i !== index) });

  const handleCreate = async () => {
    setError(null);
    const items = commitCurrent();
    if (!items) return;
    if (!items.length) {
      setError("Add at least one quote item.");
      return;
    }
    setBusy(true);
    try {
      const { job } = await apiJson<{ job: JobSummary }>(
        await fetch("/api/admin/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ details: draft.details, items }),
        }),
      );
      sessionStorage.removeItem(STORAGE_KEY);
      router.push(`/admin/jobs/${job.id}?created=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the job.");
      setBusy(false);
    }
  };

  const subtotal = draft.items.reduce((sum, d) => sum + draftTotal(d), 0) + (isBlank(current) ? 0 : draftTotal(current));

  if (!hydrated) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <ol className="mb-6 flex items-center gap-3 text-sm">
        {(
          [
            [1, "Basic info"],
            [2, "Itemized quote"],
          ] as const
        ).map(([n, label]) => (
          <li key={n} className="flex items-center gap-2">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                draft.step === n ? "bg-brand text-white" : draft.step > n ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {draft.step > n ? <Check className="h-4 w-4" /> : n}
            </span>
            <span className={draft.step === n ? "font-semibold text-slate-900" : "text-slate-500"}>{label}</span>
            {n === 1 && <span className="mx-1 h-px w-8 bg-slate-300" />}
          </li>
        ))}
      </ol>

      {draft.step === 1 && (
        <form onSubmit={handleDetailsNext} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">New job — basic info</h1>
          <p className="mt-1 text-sm text-slate-500">Customer and site details for the quote and contract.</p>
          <div className="mt-6">
            <JobDetailsFields value={draft.details} onChange={(details) => update({ details })} />
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit">
              Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      )}

      {draft.step === 2 && (
        <div className="space-y-6">
          {draft.items.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <h2 className="border-b border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Items added ({draft.items.length})
              </h2>
              <ul className="divide-y divide-slate-100">
                {draft.items.map((d, i) => (
                  <li key={i} className="flex items-start justify-between gap-4 px-6 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{d.item}</p>
                      <p className="text-xs text-slate-500">
                        {money(Number(d.materials.replace(/[$,\s]/g, "")) || 0)} materials +{" "}
                        {money(Number(d.labor.replace(/[$,\s]/g, "")) || 0)} labor × {d.quantity || 1}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-slate-900">{money(draftTotal(d))}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${d.item}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <form onSubmit={handleAddAnother} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">
              {draft.items.length ? `Item ${draft.items.length + 1}` : "First quote item"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Fill in an item, then click <strong>Next item</strong> to add another or <strong>Create job</strong> when done.
            </p>
            <div className="mt-6">
              <ItemFields value={current} onChange={setCurrent} disabled={busy} />
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
              <span className="text-slate-500">Total before discounts</span>
              <span className="text-lg font-bold text-slate-900">{money(subtotal)}</span>
            </div>

            <div className="mt-4">
              <ErrorNotice message={error} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={() => update({ step: 1 })} disabled={busy}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
              </Button>
              <div className="flex gap-3">
                <Button type="submit" variant="secondary" disabled={busy}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Next item
                </Button>
                <Button type="button" onClick={handleCreate} loading={busy}>
                  <Check className="h-4 w-4" aria-hidden="true" /> Create job
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
