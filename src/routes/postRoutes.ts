import express from "express";
import multer from "multer";
import {
  createPostController,
  getAllPostsController,
  getPostByIdController,
  getPostsByUserIdController,
  editPostByIdController,
  searchPostController,
} from "../controllers/postController";
import { isAuth } from "../middlewares/authMiddleware";
import { checkPermissions } from "../middlewares/permissionsMiddleware";

const router = express.Router();
const upload = multer();

router.post("/", isAuth, upload.single("picture"), createPostController);
router.get("/", getAllPostsController);
router.put("/", isAuth, checkPermissions(["ADMIN"]), editPostByIdController);
router.get("/by-user/:id", getPostsByUserIdController);
router.get("/:id", getPostByIdController);
router.post("/search", searchPostController);

export default router;
