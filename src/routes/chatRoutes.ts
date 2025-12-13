import express from "express";
import {
  getChatByIdConroller,
  getChatsByUserController,
  sendMessageController,
  startChatController,
} from "../controllers/chatController";
import { isAuth } from "../middlewares/authMiddleware";
import { checkPermissions } from "../middlewares/permissionsMiddleware";

const router = express.Router();

router.post("/", isAuth, startChatController);
router.post("/send", isAuth, sendMessageController);
router.get("/:id", isAuth, checkPermissions(), getChatByIdConroller);
router.get("/by-user/:id", isAuth, getChatsByUserController);

export default router;
