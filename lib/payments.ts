/**
 * Single source of truth for customer payments: payment types, limits, and the
 * parsing/validation shared by the public /pay form, the link builders, and the
 * Checkout API route. Keep this file free of server-only imports so client
 * components can use it.
 */

export const PAYMENT_TYPES = [
  { id: "deposit", label: "Deposit" },
  { id: "progress", label: "Progress Payment" },
  { id: "final", label: "Final Payment" },
  { id: "other", label: "Other" },
] as const;

export type PaymentTypeId = (typeof PAYMENT_TYPES)[number]["id"];

export const PAYMENT_LIMITS = {
  minCents: 1_00,
  maxCents: 25_000_00,
  nameMax: 120,
  emailMax: 200,
  addressMax: 200,
  refMax: 40,
  noteMax: 200,
} as const;

/** Accepts the short ids above plus a few friendly aliases people might type into a URL. */
const TYPE_ALIASES: Record<string, PaymentTypeId> = {
  deposit: "deposit",
  dep: "deposit",
  progress: "progress",
  "progress-payment": "progress",
  progresspayment: "progress",
  final: "final",
  "final-payment": "final",
  finalpayment: "final",
  balance: "final",
  other: "other",
};

export const PAYMENT_METADATA_VERSION = "1";

export interface PaymentFields {
  name: string;
  email: string;
  address: string;
  ref: string;
  type: PaymentTypeId | "";
  amount: string; // dollars as typed, e.g. "1850" or "1,850.00"
  note: string;
}

export const emptyPaymentFields: PaymentFields = {
  name: "",
  email: "",
  address: "",
  ref: "",
  type: "",
  amount: "",
  note: "",
};

export function paymentTypeLabel(type: PaymentTypeId): string {
  return PAYMENT_TYPES.find((t) => t.id === type)?.label ?? "Payment";
}

export function isPaymentType(value: unknown): value is PaymentTypeId {
  return typeof value === "string" && PAYMENT_TYPES.some((t) => t.id === value);
}

export function normalizePaymentType(value: unknown): PaymentTypeId | "" {
  if (typeof value !== "string") return "";
  return TYPE_ALIASES[value.trim().toLowerCase()] ?? "";
}

/** "1,850", "$1850.5", "1850.50" → 185050. Returns null when not a sane dollar amount. */
export function dollarsToCents(input: unknown): number | null {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) return null;
    return Math.round(input * 100);
  }
  if (typeof input !== "string") return null;
  const text = input.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  return Math.round(Number(text) * 100);
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const clip = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";

/**
 * Reads prefill values from URL search params. Unknown or invalid values are
 * ignored rather than rejected so a mistyped link still opens a usable form.
 */
export function paymentFieldsFromParams(params: URLSearchParams | Record<string, string | string[] | undefined>): PaymentFields {
  const get = (key: string): string => {
    if (params instanceof URLSearchParams) return params.get(key) ?? "";
    const v = params[key];
    return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
  };
  const cents = dollarsToCents(get("amount"));
  return {
    name: clip(get("name"), PAYMENT_LIMITS.nameMax),
    email: clip(get("email"), PAYMENT_LIMITS.emailMax),
    address: clip(get("address"), PAYMENT_LIMITS.addressMax),
    ref: clip(get("ref"), PAYMENT_LIMITS.refMax),
    type: normalizePaymentType(get("type")),
    amount: cents !== null && cents >= PAYMENT_LIMITS.minCents && cents <= PAYMENT_LIMITS.maxCents ? (cents / 100).toString() : "",
    note: clip(get("note"), PAYMENT_LIMITS.noteMax),
  };
}

/** Builds a /pay URL with only the fields that are filled in. */
export function buildPayUrl(origin: string, fields: Partial<PaymentFields>): string {
  const params = new URLSearchParams();
  for (const key of ["type", "amount", "ref", "name", "email", "address", "note"] as const) {
    const value = fields[key]?.toString().trim();
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return `${origin.replace(/\/$/, "")}/pay${query ? `?${query}` : ""}`;
}

export interface ValidatedPayment {
  name: string;
  email: string;
  address: string;
  ref: string;
  type: PaymentTypeId;
  amountCents: number;
  note: string;
}

export type ValidationResult = { ok: true; value: ValidatedPayment } | { ok: false; error: string };

/** Strict validation used by the server (and the client for instant feedback). */
export function validatePayment(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid request." };
  const body = input as Record<string, unknown>;

  const name = clip(body.name, PAYMENT_LIMITS.nameMax);
  if (!name) return { ok: false, error: "Please enter your name." };

  const email = clip(body.email, PAYMENT_LIMITS.emailMax);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "Please enter a valid email for your receipt." };

  const address = clip(body.address, PAYMENT_LIMITS.addressMax);
  const ref = clip(body.ref, PAYMENT_LIMITS.refMax);
  if (!address && !ref) return { ok: false, error: "Please enter the job address or your job/invoice number." };

  const type = normalizePaymentType(body.type);
  if (!type) return { ok: false, error: "Please choose a payment type." };

  const note = clip(body.note, PAYMENT_LIMITS.noteMax);
  if (type === "other" && !note) return { ok: false, error: "Please tell us what this payment is for." };

  const amountCents = dollarsToCents(body.amount);
  if (amountCents === null || !Number.isInteger(amountCents)) {
    return { ok: false, error: "Please enter a valid dollar amount (e.g. 1850 or 1850.00)." };
  }
  if (amountCents < PAYMENT_LIMITS.minCents) return { ok: false, error: `Minimum payment is ${formatCents(PAYMENT_LIMITS.minCents)}.` };
  if (amountCents > PAYMENT_LIMITS.maxCents) {
    return { ok: false, error: `Online payments are limited to ${formatCents(PAYMENT_LIMITS.maxCents)}. Please call us for larger amounts.` };
  }

  return { ok: true, value: { name, email, address, ref, type, amountCents, note } };
}

/** "Final Payment — INV-1042" or "Payment — 12 Oak St". */
export function paymentProductName(p: Pick<ValidatedPayment, "type" | "ref" | "address">): string {
  const label = p.type === "other" ? "Payment" : paymentTypeLabel(p.type);
  const suffix = p.ref || p.address;
  return suffix ? `${label} — ${suffix}` : label;
}

export function paymentDescription(p: Pick<ValidatedPayment, "address" | "note" | "ref">): string {
  const where = p.address || p.ref;
  const base = where ? `Painting/handyman services — ${where}` : "Painting/handyman services";
  return p.note ? `${base}. ${p.note}` : base;
}
