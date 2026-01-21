import express from "express";
import { reportUserController } from "../controllers/report.controller";
import { isAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", isAuth, reportUserController);

export default router;
