# Online payments (Stripe)

Customers can pay deposits, progress payments, final balances, and one-off amounts by card at **z-handy.com/pay**. There are no customer accounts, carts, or stored card data: the form collects who/what/how much, the server creates a Stripe Checkout Session, and Stripe hosts the actual card page, charges the card, and emails the receipt.

## Pages

| Route | Who uses it | What it does |
|---|---|---|
| `/pay` | Customers | Payment form. Can be prefilled from URL params (see below). |
| `/pay/success` | Customers | Shown after paying. Looks up the session on Stripe and confirms amount/type/job. |
| `/pay/link` | You (no login, `noindex`) | Builds a prefilled `/pay` link with **Copy link** and **Text it** buttons. Nothing is charged or stored. |
| `/admin/payment` | You / subcontractors (admin login) | Same link builder, plus a dropdown that prefills from an existing job sheet. |
| `POST /api/pay/checkout` | the `/pay` form | Validates and creates the Checkout Session. Rate-limited to 10 requests/min per IP. |

### Prefill parameters for `/pay`

```
/pay?type=final&amount=1850&ref=INV-1042&name=Jane%20Doe&address=12%20Oak%20St&email=jane@example.com&note=...
```

| Param | Values |
|---|---|
| `type` | `deposit`, `progress`, `final`, `other` (aliases like `balance` → final also work) |
| `amount` | Dollars, e.g. `1850` or `1850.50` |
| `ref` | Job or invoice number, e.g. `261001` |
| `name`, `email`, `address`, `note` | Plain text |

Unknown or invalid values are ignored rather than causing an error. Every prefilled field stays editable.

## Limits and payment types

All in one place: [`lib/payments.ts`](./lib/payments.ts) — `PAYMENT_TYPES` and `PAYMENT_LIMITS` (currently $1.00 to $25,000.00). Change them there and the form, link builders, and server validation all follow.

## What Stripe receives

- `mode: "payment"`, `customer_email` set (so Stripe emails the receipt).
- Product name `"<Type> — <ref or address>"`, e.g. `Final Payment — INV-1042`; description `Painting/handyman services — <job address>` plus the "Other" note.
- `metadata` and `payment_intent_data.metadata`: `customer_name`, `payment_type`, `payment_type_label`, `ref`, `job_address`, `note`. Search any of these in the Stripe dashboard to match a payment to a job.
- `payment_intent_data.description`: `"<product name> · <customer name>"` — shows in the Payments list and on payouts.
- `managed_payments: { enabled: false }` — in-person services are not eligible for Stripe Managed Payments, so it's disabled per session. No `tax_code` is sent.
- No `payment_method_types` — the dashboard's payment-method settings decide (cards, Apple/Google Pay, optional ACH).

## Environment variables

| Variable | Required | Where it comes from |
|---|---|---|
| `STRIPE_SECRET_KEY` | Yes | Stripe dashboard → Developers → API keys → **Secret key**. Use `sk_test_…` for Preview/Development and `sk_live_…` for Production. |
| `NEXT_PUBLIC_SITE_URL` | Optional | e.g. `https://z-handy.com`. Only needed if success/cancel redirects ever point at the wrong host; by default the origin of the request is used. |

No webhook or publishable key is needed for this flow. Secrets live only in Vercel environment variables and `.env.local` (gitignored). Never paste a secret key into chat, code, or a commit.

## Why no webhook?

The success page retrieves the Checkout Session directly from Stripe and reads `payment_status`, so there's nothing to persist server-side. If you later want payments written back to the job spreadsheet automatically, add a `checkout.session.completed` webhook; the metadata already carries the job number.
