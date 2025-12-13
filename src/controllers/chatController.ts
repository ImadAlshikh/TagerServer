import {
  getChatByIdService,
  getChatsByUserService,
  startChatService,
} from "./../services/chatService";
import { Request, Response } from "express";
import { messageSchema, MessageType } from "../utils/validator";
import { sendMessageService } from "../services/chatService";
import { io } from "..";

export const startChatController = async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;
    const userId = (req.user as any)?.id;
    const result = await startChatService({ userId, postId });
    res.status(200).json({ success: true, data: result?.id });
  } catch (error: any) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};
export const sendMessageController = async (req: Request, res: Response) => {
  try {
    const messageData: MessageType = {
      ...req.body,
      senderId: (req.user as any).id,
    };
    const messageDataValid = messageSchema.safeParse(messageData);
    if (!messageDataValid.success) {
      return res.status(401).json({ success: false, message: "Invalid data" });
    }
    const result = await sendMessageService(messageDataValid.data);

    io.to(messageData.chatId).emit("new-msg", result);

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getChatByIdConroller = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.id;
    const result = await getChatByIdService(chatId);
    if (
      (req.user as any)?.id !== result?.userId &&
      (req.user as any)?.id !== result?.post.owner.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getChatsByUserController = async (req: Request, res: Response) => {
  try {
    let userId = req.params.id;
    if (!userId) {
      userId = (req.user as any).id;
    }
    const result = await getChatsByUserService(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "error in get chats" });
  }
};
