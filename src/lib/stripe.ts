import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

export const STRIPE_CONFIG = {
  currency: "usd",
  depositAmount: 5000, // $50.00 in cents
  maxPaymentAmount: 1000000, // $10,000 max
} as const;