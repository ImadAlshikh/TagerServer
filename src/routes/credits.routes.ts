import express from "express";
import {
  getPackagesController,
  loadCreditsController,
} from "../controllers/credits.controller";
import { isAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/packages", getPackagesController);
router.post("/load", isAuth, loadCreditsController);

export default router;
