import { isAuth } from "../middlewares/auth.middleware";
import express from "express";
import { rateUserController } from "../controllers/rating.controller";

const router = express.Router();

router.post("/", isAuth, rateUserController);

export default router;
