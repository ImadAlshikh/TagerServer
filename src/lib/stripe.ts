import Stripe from "stripe";
import env from "./env.js";
export const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: "2025-12-15.clover",
});
