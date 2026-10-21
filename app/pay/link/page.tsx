import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import PaymentLinkBuilder from "@/components/pay/PaymentLinkBuilder";

export const metadata: Metadata = {
  title: "Payment link builder",
  robots: { index: false, follow: false },
};

/** Owner helper: builds a prefilled /pay link to text a customer. No login — it charges and stores nothing. */
export default function PayLinkPage() {
  return (
    <LegalPage title="Payment link builder" intro="Fill in what you know, then copy or text the link to the customer.">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <PaymentLinkBuilder />
      </div>
    </LegalPage>
  );
}
