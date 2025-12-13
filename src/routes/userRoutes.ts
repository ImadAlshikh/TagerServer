import express, { Request, Response } from "express";
import {
  signinUserController,
  getAllUsersController,
  getUserByIdController,
  getUserProfileController,
  loginUserController,
  logoutUser,
} from "../controllers/userController";
import { isAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/signin", signinUserController);
router.post("/login", loginUserController);
router.get("/", getAllUsersController);
router.get("/profile", isAuth, getUserProfileController);
router.get("/:id", getUserByIdController);
router.delete("/logout", isAuth, logoutUser);

export default router;
