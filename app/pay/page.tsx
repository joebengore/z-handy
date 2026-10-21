import type { Metadata } from "next";
import { Suspense } from "react";
import LegalPage from "@/components/LegalPage";
import PayForm from "@/components/pay/PayForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Make a Payment | ${site.name}`,
  description: `Pay a deposit, progress payment, or final balance to ${site.name} securely online by card.`,
};

export default function PayPage() {
  return (
    <LegalPage title="Make a Payment" intro="Pay a deposit, progress payment, or balance by card. It takes about a minute.">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
          <PayForm />
        </Suspense>
      </div>
    </LegalPage>
  );
}
