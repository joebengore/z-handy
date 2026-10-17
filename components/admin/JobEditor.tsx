"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Job, JobDetails } from "@/lib/jobs";
import JobDetailsFields from "@/components/admin/JobDetailsFields";
import ItemFields, { emptyItem, type ItemDraft } from "@/components/admin/ItemFields";
import { Button, ErrorNotice, apiJson, money } from "@/components/admin/ui";

export default function JobEditor({ initialJob, justCreated }: { initialJob: Job; justCreated?: boolean }) {
  const [job, setJob] = useState<Job>(initialJob);
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState<JobDetails>(initialJob.details);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);

  const [addingItem, setAddingItem] = useState(false);
  const [itemDraft, setItemDraft] = useState<ItemDraft>(emptyItem);
  const [itemError, setItemError] = useState<string | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [deletingRow, setDeletingRow] = useState<number | null>(null);

  /** Re-reads the sheet so row numbers and formula totals stay authoritative after any change. */
  const reload = async () => {
    const { job: fresh } = await apiJson<{ job: Job }>(await fetch(`/api/admin/jobs/${job.id}`, { cache: "no-store" }));
    setJob(fresh);
    return fresh;
  };

  const saveDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingDetails(true);
    setDetailsError(null);
    try {
      await apiJson(
        await fetch(`/api/admin/jobs/${job.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ details: detailsDraft }),
        }),
      );
      await reload();
      setEditingDetails(false);
    } catch (e) {
      setDetailsError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSavingDetails(false);
    }
  };

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingItem(true);
    setItemError(null);
    try {
      await apiJson(
        await fetch(`/api/admin/jobs/${job.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item: itemDraft }),
        }),
      );
      await reload();
      setItemDraft(emptyItem);
      setAddingItem(false);
    } catch (e) {
      setItemError(e instanceof Error ? e.message : "Could not add the item.");
    } finally {
      setSavingItem(false);
    }
  };

  const removeItem = async (row: number, item: string) => {
    if (!window.confirm(`Delete "${item}" from the quote?`)) return;
    setDeletingRow(row);
    setItemError(null);
    try {
      await apiJson(
        await fetch(`/api/admin/jobs/${job.id}/items`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ row, item }),
        }),
      );
      await reload();
    } catch (e) {
      setItemError(e instanceof Error ? e.message : "Could not delete the item.");
    } finally {
      setDeletingRow(null);
    }
  };

  const d = job.details;
  const detailRows: [string, string][] = [
    ["Name", d.name],
    ["Phone", d.phone],
    ["Email", d.email],
    ["Job address", d.jobAddress],
    ["Mailing address", d.mailingAddress || "Same as job address"],
    ["Sq Ft", d.sqft],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/jobs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All jobs
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            Job {job.jobNumber}
            {d.name && <span className="ml-2 text-lg font-normal text-slate-500">· {d.name}</span>}
          </h1>
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Open in Google Sheets <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      {justCreated && (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          Job spreadsheet created. Run the Z-Handyman import in the master sheet when you&apos;re ready to generate documents.
        </p>
      )}

      {/* Basic info */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Basic info</h2>
          {!editingDetails && (
            <Button
              variant="ghost"
              onClick={() => {
                setDetailsDraft(job.details);
                setDetailsError(null);
                setEditingDetails(true);
              }}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
            </Button>
          )}
        </div>
        {editingDetails ? (
          <form onSubmit={saveDetails} className="space-y-4 p-6">
            <JobDetailsFields value={detailsDraft} onChange={setDetailsDraft} disabled={savingDetails} />
            <ErrorNotice message={detailsError} />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setEditingDetails(false)} disabled={savingDetails}>
                Cancel
              </Button>
              <Button type="submit" loading={savingDetails}>
                Save changes
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid gap-x-8 gap-y-3 p-6 sm:grid-cols-2">
            {detailRows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-0.5 text-slate-900">{value || <span className="text-slate-400">—</span>}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Items */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Itemized quote</h2>
          {!addingItem && (
            <Button
              variant="ghost"
              onClick={() => {
                setItemDraft(emptyItem);
                setItemError(null);
                setAddingItem(true);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Add item
            </Button>
          )}
        </div>

        {job.items.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">No line items yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2 text-right">Materials</th>
                  <th className="px-4 py-2 text-right">Labor</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {job.items.map((item) => (
                  <tr key={item.row} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {item.link ? (
                          <a href={item.link} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                            {item.item}
                          </a>
                        ) : (
                          item.item
                        )}
                      </p>
                      {item.includes && <p className="mt-0.5 whitespace-pre-line text-xs text-slate-500">{item.includes}</p>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{money(item.materials)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{money(item.labor)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">{money(item.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(item.row, item.item)}
                        disabled={deletingRow !== null}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Delete ${item.item}`}
                      >
                        <Trash2 className={`h-4 w-4 ${deletingRow === item.row ? "animate-pulse" : ""}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50 text-sm">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right font-medium text-slate-600">
                    Total before discounts
                  </td>
                  <td className="px-4 py-2 text-right font-bold tabular-nums text-slate-900">{money(job.subtotal)}</td>
                  <td />
                </tr>
                {job.total !== null && job.total !== job.subtotal && (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right font-medium text-slate-600">
                      Total (after adjustments in sheet)
                    </td>
                    <td className="px-4 py-2 text-right font-bold tabular-nums text-slate-900">{money(job.total)}</td>
                    <td />
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        )}

        {!addingItem && itemError && (
          <div className="px-6 pb-4">
            <ErrorNotice message={itemError} />
          </div>
        )}

        {addingItem && (
          <form onSubmit={saveItem} className="space-y-4 border-t border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">New item</h3>
              <button
                type="button"
                onClick={() => setAddingItem(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ItemFields value={itemDraft} onChange={setItemDraft} disabled={savingItem} />
            <ErrorNotice message={itemError} />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setAddingItem(false)} disabled={savingItem}>
                Cancel
              </Button>
              <Button type="submit" loading={savingItem}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add to quote
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
