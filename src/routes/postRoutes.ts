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
} from "../controllers/postController";
import { isAuth } from "../middlewares/authMiddleware";
import { checkPermissions } from "../middlewares/permissionsMiddleware";

const router = express.Router();
const upload = multer();

router.post("/", isAuth, upload.single("picture"), createPostController);
router.get("/", getPostsController);
router.put("/", isAuth, upload.single("picture"), editPostByIdController);
router.get("/search", searchPostController);
router.get("/by-user/:id", getPostsByUserIdController);
router.get("/:id", getPostByIdController);

export default router;
