import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  PAYMENT_METADATA_VERSION,
  paymentDescription,
  paymentProductName,
  paymentTypeLabel,
  validatePayment,
} from "@/lib/payments";
import { clientIp, rateLimit, requestOrigin } from "@/lib/request";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const RATE_LIMIT_PER_MINUTE = 10;

export async function POST(request: Request) {
  if (!rateLimit(`pay:${clientIp(request)}`, RATE_LIMIT_PER_MINUTE)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute and try again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = validatePayment(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const p = result.value;

  // Stripe metadata values must be strings; keep keys stable so dashboard searches work.
  const metadata: Record<string, string> = {
    v: PAYMENT_METADATA_VERSION,
    customer_name: p.name,
    payment_type: p.type,
    payment_type_label: paymentTypeLabel(p.type),
    ref: p.ref,
    job_address: p.address,
    note: p.note,
  };

  const origin = requestOrigin(request);
  const description = paymentDescription(p);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: p.email,
      // In-person services aren't eligible for Managed Payments; disable per session so
      // the dashboard toggle can't break checkout.
      managed_payments: { enabled: false },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: p.amountCents,
            product_data: {
              name: paymentProductName(p),
              description,
            },
          },
        },
      ],
      metadata,
      payment_intent_data: {
        description: `${paymentProductName(p)} · ${p.name}`,
        metadata,
      },
      success_url: `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pay?canceled=1`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/STRIPE_SECRET_KEY/.test(message)) {
      console.error("checkout: Stripe is not configured");
      return NextResponse.json({ error: "Online payments aren't set up yet. Please call us to pay." }, { status: 503 });
    }
    console.error("checkout: Stripe session creation failed:", message);
    const hint = /managed payments/i.test(message)
      ? " (Stripe reported a Managed Payments error — turn Managed Payments off in the Stripe dashboard.)"
      : "";
    return NextResponse.json(
      { error: `We couldn't start the payment. Please try again or call us.${hint}` },
      { status: 502 },
    );
  }

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a payment page. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ url: session.url });
}
