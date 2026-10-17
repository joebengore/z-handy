"use client";

import { Field, Input, Textarea, money } from "@/components/admin/ui";

/** String-typed item draft used by forms; parsed server-side into a QuoteItem. */
export interface ItemDraft {
  item: string;
  materials: string;
  labor: string;
  quantity: string;
  includes: string;
  link: string;
}

export const emptyItem: ItemDraft = {
  item: "",
  materials: "",
  labor: "",
  quantity: "1",
  includes: "",
  link: "",
};

const toNumber = (text: string) => {
  const n = Number(text.replace(/[$,\s]/g, ""));
  return text.trim() && Number.isFinite(n) ? n : 0;
};

export const draftTotal = (d: ItemDraft) =>
  Math.round((toNumber(d.materials) + toNumber(d.labor)) * (toNumber(d.quantity) || 1) * 100) / 100;

export default function ItemFields({
  value,
  onChange,
  disabled,
}: {
  value: ItemDraft;
  onChange: (next: ItemDraft) => void;
  disabled?: boolean;
}) {
  const set = (key: keyof ItemDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...value, [key]: e.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <div className="sm:col-span-4">
        <Field label="Item" required hint="Short description, e.g. “Paint living room walls — 2 coats”.">
          <Input value={value.item} onChange={set("item")} disabled={disabled} autoComplete="off" required />
        </Field>
      </div>
      <Field label="Materials ($)">
        <Input inputMode="decimal" placeholder="0.00" value={value.materials} onChange={set("materials")} disabled={disabled} />
      </Field>
      <Field label="Labor ($)">
        <Input inputMode="decimal" placeholder="0.00" value={value.labor} onChange={set("labor")} disabled={disabled} />
      </Field>
      <Field label="Quantity (#)">
        <Input inputMode="decimal" value={value.quantity} onChange={set("quantity")} disabled={disabled} />
      </Field>
      <Field label="Item Total" hint="(Materials + Labor) × Quantity">
        <Input value={money(draftTotal(value))} readOnly tabIndex={-1} className="bg-slate-50 font-semibold" />
      </Field>
      <div className="sm:col-span-4">
        <Field label="Includes" hint="Notes that appear in the quote under this item.">
          <Textarea rows={2} value={value.includes} onChange={set("includes")} disabled={disabled} />
        </Field>
      </div>
      <div className="sm:col-span-4">
        <Field label="Link" hint="Optional product page or reference image URL.">
          <Input type="url" placeholder="https://" value={value.link} onChange={set("link")} disabled={disabled} />
        </Field>
      </div>
    </div>
  );
}
