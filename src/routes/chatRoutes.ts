import express from "express";
import {
  getChatByIdConroller,
  sendMessageController,
} from "../controllers/chatController";
import { isAuth } from "../middlewares/authMiddleware";
import { checkPermissions } from "../middlewares/permissionsMiddleware";

const router = express.Router();

router.post("/send", isAuth, sendMessageController);
router.get("/:id", isAuth, checkPermissions(), getChatByIdConroller);

export default router;
