import express from "express";
import { reportUserController } from "../controllers/report.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", isAuth, reportUserController);

export default router;
