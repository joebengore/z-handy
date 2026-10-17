import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

/** Simple shell for standalone legal pages (privacy, terms) outside the one-page home layout. */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex items-center">
            <Image src="/images/logo-wide-blue.svg" alt={`${site.name} logo`} width={180} height={48} className="h-10 w-auto" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
        <div className="prose-legal mt-8 space-y-6 text-slate-700">{children}</div>
      </main>
      <Footer />
    </>
  );
}
