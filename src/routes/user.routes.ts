import express, { Request, Response } from "express";
import {
  signupUserController,
  signinUserController,
  getAllUsersController,
  getUserByIdController,
  getProfileController,
  updateProfileController,
  logoutController,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const uploader = multer();

router.post("/signup", signupUserController);
router.post("/signin", signinUserController);
router.get("/", getAllUsersController);
router.get("/profile", isAuth, getProfileController);
router.put(
  "/profile",
  isAuth,
  uploader.single("picture"),
  updateProfileController,
);
router.get("/:id", getUserByIdController);
router.delete("/logout", isAuth, logoutController);

export default router;
