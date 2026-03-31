import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    model: "openrouter/auto",
    maxSites: 3,
    maxPages: 5,
    interval: null as string | null,
  },
  pro: {
    name: "Pro",
    price: 9,
    model: "anthropic/claude-sonnet-4",
    maxSites: 20,
    maxPages: 50,
    interval: "month",
  },
  unlimited: {
    name: "Unlimited",
    price: 29,
    model: "anthropic/claude-opus-4",
    maxSites: -1,
    maxPages: -1,
    interval: "month",
  },
};

export type PlanKey = keyof typeof PLANS;
