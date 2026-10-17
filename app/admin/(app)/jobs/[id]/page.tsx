import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getJob, NotFoundError } from "@/lib/jobs";
import JobEditor from "@/components/admin/JobEditor";

export const dynamic = "force-dynamic";

export default async function JobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);

  try {
    const job = await getJob(id);
    return <JobEditor initialJob={job} justCreated={created === "1"} />;
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    const message = error instanceof Error ? error.message : "Could not load this job.";
    return (
      <div>
        <Link href="/admin/jobs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All jobs
        </Link>
        <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      </div>
    );
  }
}
