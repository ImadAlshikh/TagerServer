import express from "express";
import {
  createPostController,
  getAllPostsController,
  getPostByIdController,
  getPostsByUserIdController,
  editPostByIdController,
} from "../controllers/postController";
import { isAuth } from "../middlewares/authMiddleware";
import { checkPermissions } from "../middlewares/permissionsMiddleware";

const router = express.Router();

router.post("/", isAuth, createPostController);
router.get("/", getAllPostsController);
router.put(
  "/",
  isAuth,
  checkPermissions(["ADMIN", "OWNER"]),
  editPostByIdController
);
router.get("/by-user/:id", getPostsByUserIdController);
router.get("/:id", getPostByIdController);

export default router;
