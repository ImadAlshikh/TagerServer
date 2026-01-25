import express from "express";
import multer from "multer";
import {
  createPostController,
  getAllPostsController,
  getPostByIdController,
  getPostsByUserIdController,
  editPostByIdController,
  searchPostController,
  getPostsController,
  deletePostByIdController,
  deletePostImageByIdController,
} from "../controllers/post.controller";
import { isAuth } from "../middlewares/auth.middleware";
import { checkPermissions } from "../middlewares/permissions.middleware";

const router = express.Router();
const upload = multer();

router.post("/", isAuth, upload.single("picture"), createPostController);
router.get("/", getPostsController);
router.put("/", isAuth, upload.single("picture"), editPostByIdController);
router.delete("/:id", isAuth, deletePostByIdController);
router.delete("/:id/image", isAuth, deletePostImageByIdController);
router.get("/search", searchPostController);
router.get("/by-user/:id", getPostsByUserIdController);
router.get("/:id", getPostByIdController);

export default router;
