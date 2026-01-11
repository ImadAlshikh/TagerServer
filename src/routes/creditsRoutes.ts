import express from "express";
import { loadCreditsController } from "../controllers/creditsController";
import { isAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/load", isAuth, loadCreditsController);

export default router;
