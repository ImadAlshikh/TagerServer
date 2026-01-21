import express, { Router } from "express";
import { createCheckout } from "../controllers/stripe.controller";
import { handleStripeWebhook } from "../webhooks/stripe.webhook.controller";
import { isAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create-checkout", isAuth, createCheckout);

export default router;
