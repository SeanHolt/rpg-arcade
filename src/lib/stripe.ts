import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }
  if (!globalForStripe.stripe) {
    globalForStripe.stripe = new Stripe(key);
  }
  return globalForStripe.stripe;
}