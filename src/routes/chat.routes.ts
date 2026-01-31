import express from "express";
import {
  getChatByIdConroller,
  getChatsByUserController,
  sendMessageController,
  startChatController,
} from "../controllers/chat.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { checkPermissions } from "../middlewares/permissions.middleware.js";

const router = express.Router();

router.post("/", isAuth, startChatController);
router.post("/send", isAuth, sendMessageController);
router.get("/by-user", isAuth, getChatsByUserController);
router.get("/:id", isAuth, checkPermissions(), getChatByIdConroller);

export default router;
