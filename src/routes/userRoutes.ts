import express, { Request, Response } from "express";
import {
  signinUserController,
  getAllUsersController,
  getUserByIdController,
  getProfileController,
  loginUserController,
  updateProfileController,
} from "../controllers/userController";
import { isAuth } from "../middlewares/authMiddleware";
import multer from "multer";

const router = express.Router();
const uploader = multer();

router.post("/signin", signinUserController);
router.post("/login", loginUserController);
router.get("/", getAllUsersController);
router.get("/profile", isAuth, getProfileController);
router.put(
  "/profile",
  isAuth,
  uploader.single("picture"),
  updateProfileController
);
router.get("/:id", getUserByIdController);
// router.delete("/logout", isAuth, logoutUser);

export default router;
