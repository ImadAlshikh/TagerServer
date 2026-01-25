import express from "express";
import {
  getPackagesController,
  getPaymentHistoryController,
  getPricesController,
} from "../controllers/credits.controller";
import { isAuth } from "../middlewares/auth.middleware";

const router = express.Router();
router.get("/prices", getPricesController);
router.get("/packages", getPackagesController);
router.get("/history", isAuth, getPaymentHistoryController);

export default router;
