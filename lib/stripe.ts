import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazily constructs the Stripe client so builds and unrelated routes don't need the key. */
export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it in Vercel → Settings → Environment Variables (and .env.local for development).",
      );
    }
    client = new Stripe(key, { appInfo: { name: "z-handy.com payments" }, httpClient: Stripe.createFetchHttpClient() });
  }
  return client;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
