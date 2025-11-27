import { isAuth } from "./../middlewares/authMiddleware";
import express from "express";
import { rateUserController } from "../controllers/ratingController";

const router = express.Router();

router.post("/", isAuth, rateUserController);

export default router;
