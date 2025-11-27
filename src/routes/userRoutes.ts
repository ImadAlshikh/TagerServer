import express, { Request, Response } from "express";
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  getUserProfileController,
} from "../controllers/userController";
import { isAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", createUserController);
router.get("/", getAllUsersController);
router.get("/profile", isAuth, getUserProfileController);
router.get("/:id", getUserByIdController);

export default router;
