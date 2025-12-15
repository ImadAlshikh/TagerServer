import {
  getChatByIdService,
  getChatsByUserService,
  startChatService,
} from "./../services/chatService";
import { Request, Response } from "express";
import { messageSchema, MessageType } from "../utils/validator";
import { sendMessageService } from "../services/chatService";
import { io } from "..";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const startChatController = catchAsync(
  async (req: Request, res: Response) => {
    const { postId } = req.body;
    const userId = (req.user as any)?.id;
    const result = await startChatService({ userId, postId });
    res.status(200).json({ success: true, data: result?.id });
  }
);

export const sendMessageController = catchAsync(
  async (req: Request, res: Response) => {
    const messageData: MessageType = {
      ...req.body,
      senderId: (req.user as any).id,
    };
    const messageDataValid = messageSchema.safeParse(messageData);
    if (!messageDataValid.success) {
      throw new AppError("Invalid message data", 400);
    }
    const result = await sendMessageService(messageDataValid.data);

    io.to(messageData.chatId).emit("new-msg", result);

    return res.status(201).json({ success: true, data: result });
  }
);

export const getChatByIdConroller = catchAsync(
  async (req: Request, res: Response) => {
    const chatId = req.params.id;
    const result = await getChatByIdService(chatId);
    if (
      (req.user as any)?.id !== result?.userId &&
      (req.user as any)?.id !== result?.post.owner.id
    ) {
      throw new AppError("Access denied", 403);
    }
    res.status(200).json({ success: true, data: result });
  }
);

export const getChatsByUserController = catchAsync(
  async (req: Request, res: Response) => {
    let userId = req.params.id;
    if (!userId) {
      userId = (req.user as any).id;
    }
    const result = await getChatsByUserService(userId);
    res.status(200).json({ success: true, data: result });
  }
);
