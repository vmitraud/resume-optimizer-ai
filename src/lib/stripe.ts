import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_not_configured");

export const UNLIMITED_PLAN_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";
