import express from "express";
import {
  getPackagesController,
  getPaymentHistoryController,
  getPricesController,
} from "../controllers/credits.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/prices", getPricesController);
router.get("/packages", getPackagesController);
router.get("/history", isAuth, getPaymentHistoryController);

export default router;
