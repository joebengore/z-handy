import AdminPaymentBuilder from "@/components/admin/AdminPaymentBuilder";
import { listJobs, type JobSummary } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function AdminPaymentPage() {
  let jobs: JobSummary[] = [];
  let jobsError: string | null = null;
  try {
    jobs = await listJobs();
  } catch (e) {
    jobsError = e instanceof Error ? e.message : "Could not load jobs.";
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Create payment request</h1>
      <p className="mt-1 text-sm text-slate-500">
        Enter a job number to pull in the customer&apos;s details, choose the payment type and amount, then copy or text the
        secure Stripe link.
      </p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AdminPaymentBuilder jobs={jobs} jobsError={jobsError} />
      </div>
    </div>
  );
}
