"use client";

import { Field, Input, Textarea } from "@/components/admin/ui";
import { PAYMENT_LIMITS, PAYMENT_TYPES, dollarsToCents, formatCents, type PaymentFields } from "@/lib/payments";

const selectClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm " +
  "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:bg-slate-50";

/**
 * Field set shared by the customer form, the link builder, and the admin page.
 * `mode="link"` relaxes requirements because the owner may leave fields for the customer.
 */
export default function PaymentFieldsForm({
  value,
  onChange,
  disabled,
  mode = "pay",
  refOptions,
  refHint,
}: {
  value: PaymentFields;
  onChange: (next: PaymentFields) => void;
  disabled?: boolean;
  mode?: "pay" | "link";
  /** Autocomplete suggestions for the job/invoice field (admin only). */
  refOptions?: { value: string; label: string }[];
  /** Replaces the default hint under the job/invoice field. */
  refHint?: React.ReactNode;
}) {
  const set =
    (key: keyof PaymentFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ ...value, [key]: e.target.value });

  const paying = mode === "pay";
  const cents = dollarsToCents(value.amount);
  const amountPreview = cents !== null && cents > 0 ? formatCents(cents) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={paying ? "Your name" : "Customer name"} required={paying}>
        <Input value={value.name} onChange={set("name")} disabled={disabled} autoComplete="name" maxLength={PAYMENT_LIMITS.nameMax} required={paying} />
      </Field>
      <Field label={paying ? "Email" : "Customer email"} required={paying} hint={paying ? "Your receipt will be emailed here." : "Receipt goes here."}>
        <Input type="email" value={value.email} onChange={set("email")} disabled={disabled} autoComplete="email" maxLength={PAYMENT_LIMITS.emailMax} required={paying} />
      </Field>
      <Field label="Job / invoice number" hint={refHint ?? "If you have one, e.g. 261001 or INV-1042."}>
        <Input
          value={value.ref}
          onChange={set("ref")}
          disabled={disabled}
          autoComplete="off"
          maxLength={PAYMENT_LIMITS.refMax}
          list={refOptions ? "pay-ref-options" : undefined}
        />
        {refOptions && (
          <datalist id="pay-ref-options">
            {refOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </datalist>
        )}
      </Field>
      <Field label="Job address" hint={paying ? "Required if you don't have a job number." : undefined}>
        <Input value={value.address} onChange={set("address")} disabled={disabled} autoComplete="street-address" maxLength={PAYMENT_LIMITS.addressMax} />
      </Field>
      <Field label="Payment type" required={paying}>
        <select value={value.type} onChange={set("type")} disabled={disabled} required={paying} className={selectClass}>
          <option value="">Choose…</option>
          {PAYMENT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Amount (USD)" required={paying} hint={amountPreview ?? `Between ${formatCents(PAYMENT_LIMITS.minCents)} and ${formatCents(PAYMENT_LIMITS.maxCents)}.`}>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">$</span>
          <Input inputMode="decimal" placeholder="0.00" value={value.amount} onChange={set("amount")} disabled={disabled} className="pl-7" required={paying} />
        </div>
      </Field>
      {(value.type === "other" || mode === "link") && (
        <div className="sm:col-span-2">
          <Field
            label={value.type === "other" ? "What is this payment for?" : "Description (optional)"}
            required={paying && value.type === "other"}
            hint="Shown on the payment page and your receipt."
          >
            <Textarea rows={2} value={value.note} onChange={set("note")} disabled={disabled} maxLength={PAYMENT_LIMITS.noteMax} required={paying && value.type === "other"} />
          </Field>
        </div>
      )}
    </div>
  );
}
