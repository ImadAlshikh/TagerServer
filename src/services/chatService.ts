import prisma from "../lib/prisma";
import { MessageType } from "../utils/validator";

export const sendMessageService = async (messageData: MessageType) => {
  const { text, senderId, postId } = messageData;
  const message = await prisma.message.create({
    data: {
      text: text,
      sender: { connect: { id: senderId } },
      chat: {
        connectOrCreate: {
          where: { userId_postId: { userId: senderId, postId } },
          create: {
            user: { connect: { id: senderId } },
            post: { connect: { id: postId } },
          },
        },
      },
    },
  });
  return message;
};

export const getChatByIdService = async (chatId: string) => {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: true,
      post: {
        select: {
          owner: {
            select: { id: true, name: true, surname: true, picture: true },
          },
        },
      },
    },
  });
  return chat;
};
