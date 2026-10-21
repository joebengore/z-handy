# Stripe payments — to-do list

Everything you need to do to turn on card payments at **z-handy.com/pay**. The code is deployed; these are the account, settings, and testing steps. Written for someone who hasn't used Stripe before.

Related: [`PAYMENTS_SETUP.md`](./PAYMENTS_SETUP.md) (how the integration works), [`ADMIN_SETUP.md`](./ADMIN_SETUP.md) (admin login and Google Sheets).

**Rule for every step:** never paste a secret key (`sk_test_…` / `sk_live_…`) into chat, a text message, a commit, or any file other than `.env.local` and Vercel's environment variables.

---

## Part 1 — Create and activate the Stripe account

Stripe reviews every new account. Accounts get flagged or paused when what you tell Stripe doesn't match what the website shows, when policies are missing, or when the business looks like "pay now, deliver much later" with no protections. Everything below is written to avoid that.

### 1.1 Create the account (≈3 min)

1. Go to <https://dashboard.stripe.com/register>.
2. Email: **pro.zhandyman@gmail.com** (or `contact@z-handy.com` if you prefer business mail there — either way, use an inbox you check daily, because Stripe sends time-limited "we need more information" requests).
3. Full name: your legal name. Country: **United States**.
4. Verify the email, then turn on **two-step authentication** when prompted (use an authenticator app or SMS). Stripe will nag until you do.

### 1.2 Activate payments — the business profile (≈15 min)

Click **Activate payments** (banner at the top of the dashboard). Have ready: EIN letter (`company/CP_575_G.pdf`), your driver's license, the business bank account routing + account numbers, and your SSN (Stripe is legally required to verify the owner).

Fill in the form **exactly** like this:

| Field | Enter |
|---|---|
| Type of business | **Company → Limited Liability Company (LLC)** |
| Legal business name | **Z-Handyman LLC** (must match the EIN letter character-for-character) |
| EIN | From `CP_575_G.pdf` |
| Doing business as | **Z-Handyman** |
| Registered business address | **2850 34th St N, Suite 105, St. Petersburg, FL 33713** |
| Business phone | **(813) 540-9095** |
| Industry | **Home services → Contractors** (if the list differs, pick *Construction / Contractors* or *Painting contractors*; avoid anything "General retail" or "Other"). Stripe assigns MCC **1799 — Special Trade Contractors** for this; that's correct for painting and handyman work. (Stripe doesn't ask for a NAICS code, but if any other form does — IRS, Florida DOR, insurance, Business Tax Receipt — the primary is **238320 Painting and Wall Covering Contractors**; secondary 236118 Residential Remodelers and 561730 Landscaping Services.) |
| Business website | **https://z-handy.com** |
| Product description | Use the text in **1.3** below, verbatim |
| Customer support phone | **(813) 540-9095** |
| Customer support email | **contact@z-handy.com** |
| Customer support address | Same as business address |
| Statement descriptor | **Z-HANDYMAN** |
| Shortened descriptor | **ZHANDYMAN** |
| Business representative | You — legal name, DOB, home address, SSN, title **Owner / Managing Member**, ownership ≥25% ✔ |
| Payout bank account | Business checking: routing + account number (double-check; a typo delays your first payout by weeks) |
| Payout schedule | Leave the default (automatic, daily, 2-business-day rolling) |

If Stripe asks **"When do customers typically receive what they pay for?"** choose **"Within 1–2 weeks"** or the closest option, and if it asks **"What percentage of payments are for future delivery?"** answer honestly (roughly half — deposits are collected before work starts; final payments after). These questions exist to size dispute risk; honest answers with the description below are fine for a contractor.

### 1.3 Product description — copy this

Stripe reads this. It should match the website, name the service plainly, and show that money is tied to signed work agreements.

> Z-Handyman LLC is a licensed and insured residential and commercial painting and handyman contractor serving the Tampa Bay area of Florida (Tampa, St. Petersburg, Clearwater, Brandon, Wesley Chapel). We provide interior and exterior painting, surface preparation, drywall and trim repair, light carpentry, landscape installation, and general home repairs performed in person at the customer's property.
>
> Customers receive a written itemized quote and sign a work agreement before any payment is collected. Online payments at z-handy.com/pay are used to collect the deposit stated in the agreement (typically 25–50% of the quoted price), progress payments on larger multi-week projects, and the final balance after the customer has inspected the completed work. Typical payments range from $200 to $10,000; the site limits online payments to $25,000. Work begins within 1–2 weeks of the deposit and most projects are completed within 1–3 weeks.
>
> We do not sell goods online, ship products, offer subscriptions, or accept payment for anything other than our own labor and the materials used on the job. Refunds and cancellations are handled per the signed agreement: deposits for work not yet started are refunded less documented material costs already incurred; completed work is covered by our written workmanship warranty.

Keep this honest. If your deposit percentage or timelines differ, change the numbers — but keep the structure (what you sell, in person, written agreement first, refund terms).

### 1.4 Make the website match what you told Stripe (≈10 min)

Stripe's reviewers open the site. These must be visible without logging in:

- [ ] Business name, phone, email, and physical address — **already in the footer and Privacy page.**
- [ ] A clear description of services and that they're performed in person — **already on the home page.**
- [ ] Privacy Policy and Terms of Service — **already at `/privacy` and `/terms`, linked in the footer.**
- [ ] A **refund / cancellation policy** that matches 1.3. The Terms page currently says payment terms are in the signed agreement, which is thin for Stripe. Add a short "Payments, refunds, and cancellations" section to `/terms` with this wording (ask Copilot to add it, or edit `app/terms/page.tsx`):

  > **Payments, refunds, and cancellations.** Online payments collected at z-handy.com/pay are applied to the deposit, progress payment, or final balance stated in your signed work agreement. You may cancel before work begins by notifying us in writing; your deposit will be refunded less any documented, non-returnable material costs already incurred for your project. Once work has begun, payments for completed work are non-refundable, and any remaining balance is due as stated in the agreement. Completed work is covered by our written workmanship warranty. Refunds are issued to the original payment method within 10 business days.

- [ ] The statement descriptor **Z-HANDYMAN** matches the brand on the site so customers recognize the charge and don't dispute it.

### 1.5 After submitting

- Most accounts are approved in minutes to a day. Live API keys (`sk_live_…`) appear once approved.
- If Stripe emails asking for documents (EIN letter, a utility bill for the address, your ID), reply within the deadline through the dashboard — unanswered requests are the most common cause of paused payouts.
- You can process **test** payments immediately; live payments only after approval.

---

## Part 2 — Dashboard settings checklist (before taking a live payment)

Set the **Test mode** toggle (top-right) to **OFF** for all of these. Each lives under the gear icon → **Settings**.

| # | Setting | Where | Set it to |
|---|---|---|---|
| 1 | Business details | Settings → Business → **Business details** | Support email `contact@z-handy.com`, support phone `(813) 540-9095`, website `https://z-handy.com`. These print on receipts. |
| 2 | Statement descriptor | Settings → Business → **Public details** | **Z-HANDYMAN** / shortened **ZHANDYMAN** |
| 3 | Branding | Settings → Business → **Branding** | Upload the logo (export `public/images/logo-wide-blue.svg` to PNG), icon, brand color `#1e3a8a`, accent `#f59e0b`. Shows on the Checkout page and receipts. |
| 4 | Payout bank account | Settings → Business → **Bank accounts and scheduling** | Business checking account verified; schedule *Automatic, daily*. |
| 5 | **Managed Payments OFF** | Settings → Payments → **Managed Payments** (only appears for some accounts) | **Not enrolled / Off.** It's for digital goods only; our services aren't eligible. The code also disables it on every session, so this just keeps the dashboard consistent. |
| 6 | **Customer receipts ON** | Settings → Business → **Customer emails** | **Successful payments ✔**, **Refunds ✔**. This is the receipt the website promises. |
| 7 | **Owner notifications ON** | Avatar (top-right) → **Profile → Notifications** | **Successful payments ✔**, **Disputes ✔**, **Payouts ✔**. One email per customer payment. |
| 8 | Payment methods | Settings → Payments → **Payment methods** | **Cards ✔**, **Apple Pay ✔**, **Google Pay ✔**, **Link ✔**. Turn **OFF** Klarna, Affirm, Afterpay, Cash App Pay (buy-now-pay-later isn't appropriate for contractor deposits and raises dispute risk). |
| 9 | **ACH Direct Debit — turn ON** | Same page → **US bank account** | Recommended. Cards cost 2.9% + 30¢ (≈$537 on an $18,500 final payment); ACH is 0.8% capped at **$5**. It appears on the payment page automatically. Caveat: ACH takes ~4 business days to settle and can fail afterward (insufficient funds). The success page already says "being processed" for ACH; treat a job as paid only when the dashboard shows **Succeeded**. |
| 10 | Radar (fraud) | Settings → **Radar → Rules** | Leave defaults. Confirm "Block if CVC verification fails" and "Block if postal code fails" are on (they are by default). |
| 11 | Disputes | Settings → Business → **Customer emails** → *Disputes* | Leave on. Keep signed agreements, quotes, and before/after photos per job — that's what wins a chargeback. |
| 12 | Team | Settings → **Team and security** | Only you for now. If a subcontractor needs to see payments, add them as **View only**, never Administrator. |

---

## Part 3 — Keys and environment variables

### 3.1 Get the keys

1. Dashboard → **Developers** (bottom-left or top-right) → **API keys**.
2. With **Test mode ON** (orange): under *Standard keys*, click **Reveal test key** next to **Secret key**. Starts with `sk_test_`.
3. With **Test mode OFF** (after activation): same place, **Reveal live key**. Starts with `sk_live_`.

You never need the *Publishable key* or a webhook secret for this integration.

### 3.2 Local development — `.env.local`

Create `D:\wkspaces\z-handy\.env.local` (already gitignored) containing:

```
STRIPE_SECRET_KEY=sk_test_REPLACE_ME
ADMIN_PASSWORD=your-admin-password
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_DRIVE_FOLDER_ID=...
```

Then `npm run dev` → <http://localhost:3000/pay>.

### 3.3 Vercel

Vercel → project → **Settings → Environment Variables** → **Add**. Create these rows:

| Variable | Environment(s) | Value | How to get it |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | **Preview**, **Development** | `sk_test_…` | 3.1 step 2 |
| `STRIPE_SECRET_KEY` | **Production** | `sk_live_…` | 3.1 step 3 (after activation) |
| `NEXT_PUBLIC_SITE_URL` | All (optional) | `https://z-handy.com` | Type it. Only needed if a success/cancel redirect ever lands on a `*.vercel.app` address. |

Add the two `STRIPE_SECRET_KEY` rows as **separate entries**, each scoped to its environment(s). Then redeploy (**Deployments → ⋯ → Redeploy**, or push a commit).

Until the Production key is set, the live site shows "Online payments aren't set up yet. Please call us to pay." rather than an error.

---

## Part 4 — Take a payment *today* from a waiting customer (no website needed)

Stripe can email a hosted invoice with a Pay button. Requires an activated account (Part 1) and **Test mode OFF**.

1. Left menu **Customers → + Add customer**. Name, email, and (optional) the job address in *Address*. **Add customer**.
2. Left menu **Invoices → + Create invoice**.
3. **Customer**: pick them.
4. **Items → Add item → Add one-off item**:
   - Name: `Final Payment — 261001` (use the job number; or `Deposit — 12 Oak St`)
   - Description: `Painting/handyman services — 12 Oak St, Tampa`
   - Amount: the dollar figure. Quantity 1. No tax.
5. **Payment due**: *On receipt* (or a date). **Collection method**: *Email invoice to customer with link to pay*. Make sure **Card** and (if enabled) **ACH** are ticked under payment methods.
6. **Memo** (optional, shows on the invoice): `Per signed work agreement dated …`
7. **Send invoice**. The customer gets an email with **Pay this invoice**; it works on any phone. You get an email when it's paid, and the money follows your normal payout schedule.

Faster alternative from your phone: **Payment Links → + New → Customers choose what to pay** *off*, enter name/amount → **Create link** → copy the `buy.stripe.com/…` URL and text it. (Once the site's live key is in, use **z-handy.com/admin → Payment** instead — it prefills from the job and keeps everything matched to the job number.)

---

## Part 5 — Test plan (Test mode, ≈15 min)

Card **4242 4242 4242 4242**, expiry any future date (`12/34`), CVC `123`, ZIP `33713`. Use a real email you can check — receipts are sent in test mode too once Part 2 #6 is on.

"Verify in dashboard" = Dashboard (**Test mode ON**) → **Payments** → click the payment → the **Description** reads `<Type> — <ref> · <name>` and **Metadata** lists `payment_type`, `ref`, `job_address`, `customer_name`, `note`.

| # | Test | Steps | Expected |
|---|---|---|---|
| 1 | **Deposit** | `/pay` → name *Jane Doe*, your email, job # `261001`, type **Deposit**, amount `500` → *Continue to secure payment* | Stripe page shows **Deposit — 261001**, $500.00, your email prefilled. Pay. → `/pay/success`: "Thank you — your payment was received", Amount $500.00, Payment type Deposit, Job # 261001. Receipt email arrives. Verify in dashboard. |
| 2 | **Progress Payment** | type **Progress Payment**, no job #, address `12 Oak St`, `1250.50` | Product **Progress Payment — 12 Oak St**, description "Painting/handyman services — 12 Oak St". Success shows $1,250.50. |
| 3 | **Final Payment** | type **Final Payment**, job # `INV-1042`, `1850` | **Final Payment — INV-1042**. |
| 4 | **Other** | type **Other** → "What is this payment for?" box appears. Leave it blank → Continue | Browser blocks submit. Enter `Extra outlet install` → Continue → Stripe shows **Payment — <ref>** and the note in the description; success page shows **For: Extra outlet install**. |
| 5 | **Prefilled link** | Open `/pay/link`. Name *Jane Doe*, type *Final*, `1850`, job # `INV-1042`, address `12 Oak St` → **Copy link** → paste into a new tab | All five fields prefilled and editable. Change amount to `1900` → Stripe shows $1,900 (edits win over the link). |
| 6 | **Bad params ignored** | Open `/pay?type=refund&amount=abc&foo=bar&name=Jane` | Page loads normally; name = Jane; type and amount blank; no error. |
| 7 | **Canceled** | Start any payment; on the Stripe page click the **← back arrow** (top-left) | Lands on `/pay?canceled=1` with the amber "Your payment was canceled and nothing was charged" notice and your fields still filled. Dashboard: no payment (an *Incomplete* checkout session is normal). |
| 8 | **Invalid amount** | Amount `0.50` → Continue | Red error **Minimum payment is $1.00.** Then `25000.01` → **Online payments are limited to $25,000.00…**. Then `12.345` → **Please enter a valid dollar amount**. No Stripe page opens for any of them. |
| 9 | **Declined card** | Any payment with **4000 0000 0000 0002** | Stripe page says "Your card was declined"; retry with 4242 works. |
| 10 | **ACH (if enabled)** | Any payment → choose *US bank account* → test bank login → account `000123456789`, routing `110000000` | Success page says **Your payment is being processed** (not "received"). Dashboard shows *Processing* then *Succeeded* after a few minutes in test mode. |
| 11 | **Admin job lookup** | Log in → **Payment** tab → type a real job number from your Drive | Name, email, address fill in; hint shows **Loaded 2610XX · Name · quote $X** with **Use total** / **50% deposit**. Copy link → opens prefilled. |
| 12 | **Rate limit** | Submit the form 11+ times in one minute from the same connection | 11th attempt shows "Too many attempts. Please wait a minute and try again." |

---

## Part 6 — Go live

1. Confirm Part 1 approved (no banner), Part 2 all set, Production `STRIPE_SECRET_KEY` = `sk_live_…` in Vercel, redeployed.
2. Make **one real $1 payment to yourself** at <https://z-handy.com/pay>: type *Other*, note `live test`. Confirm: success page, your receipt email, your owner notification email, the payment in the live dashboard.
3. Refund it: **Payments → the payment → Refund → Full refund**.
4. Text yourself a link from **z-handy.com/admin → Payment** to make sure the *Text it* button works on your phone.
5. Save this file's Part 4 steps somewhere handy for days the site is down.

### Keeping the account healthy

- **Only charge what's in a signed agreement**, and keep the agreement, quote, and photos per job. If a customer disputes a charge, Stripe asks for exactly those within ~7 days.
- **Refund through Stripe, not by check** — refunds in the dashboard close the loop and avoid the customer also filing a chargeback.
- **Don't let payments sit in Processing** — a failed ACH shows up as an email; follow up with the customer the same day.
- **Answer Stripe emails fast** — info requests have deadlines; missing them pauses payouts.
- Match a payment to a job anytime by searching the job number in the dashboard search bar.
