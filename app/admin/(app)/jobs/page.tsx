import Link from "next/link";
import { ExternalLink, FilePlus2 } from "lucide-react";
import { listJobs, type JobSummary } from "@/lib/jobs";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function JobsPage() {
  let jobs: JobSummary[] = [];
  let error: string | null = null;
  try {
    jobs = await listJobs();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load jobs.";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
          <p className="mt-1 text-sm text-slate-500">One Google Sheet per job, newest first.</p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-light"
        >
          <FilePlus2 className="h-4 w-4" aria-hidden="true" /> New job
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && jobs.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No jobs yet. Create the first one.
        </p>
      )}

      {jobs.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Job #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="hidden px-4 py-3 sm:table-cell">Job address</th>
                <th className="hidden px-4 py-3 md:table-cell">Updated</th>
                <th className="px-4 py-3 text-right">Sheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/jobs/${job.id}`} className="font-semibold text-brand hover:underline">
                      {job.jobNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    <Link href={`/admin/jobs/${job.id}`} className="hover:underline">
                      {job.customerName || <span className="text-slate-400">—</span>}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{job.jobAddress}</td>
                  <td className="hidden px-4 py-3 text-slate-500 md:table-cell">{formatDate(job.modifiedTime)}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-brand"
                      aria-label={`Open ${job.jobNumber} in Google Sheets`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
