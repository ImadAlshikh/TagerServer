import express from "express";
import { reportUserController } from "../controllers/reportController";
import { isAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", isAuth, reportUserController);

export default router;
