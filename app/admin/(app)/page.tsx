import Link from "next/link";
import { FilePlus2, FolderOpen } from "lucide-react";

const choices = [
  {
    href: "/admin/new",
    icon: FilePlus2,
    title: "New job",
    description: "Enter customer details and the itemized quote. Creates the job spreadsheet in Google Drive.",
  },
  {
    href: "/admin/jobs",
    icon: FolderOpen,
    title: "Existing jobs",
    description: "Browse jobs by number, review line items, and edit details or items.",
  },
] as const;

export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">What would you like to do?</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {choices.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand hover:shadow-md"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-white">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
