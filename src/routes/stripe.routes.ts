import express, { Router } from "express";
import { createCheckout } from "../controllers/stripe.controller.js";
import { handleStripeWebhook } from "../webhooks/stripe.webhook.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-checkout", isAuth, createCheckout);

export default router;
