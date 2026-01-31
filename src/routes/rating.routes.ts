import { isAuth } from "../middlewares/auth.middleware.js";
import express from "express";
import { rateUserController } from "../controllers/rating.controller.js";

const router = express.Router();

router.post("/", isAuth, rateUserController);

export default router;
