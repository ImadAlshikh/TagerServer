import { prisma } from "../lib/prisma.js";
import { MessageType } from "../utils/validator.js";
import { AppError } from "../utils/AppError.js";

export const startChatService = async ({
  userId,
  postId,
}: {
  userId: string;
  postId: string;
}) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError("Post not found", 404);
  if (userId === post.ownerId) {
    const chat = await prisma.chat.findFirst({
      where: { postId },
      select: { id: true },
    });
    return chat;
  }

  const existingChat = await prisma.chat.findFirst({
    where: {
      OR: [
        { userId: userId, postId: postId },
        { userId: post?.ownerId, postId: postId },
      ],
    },
    select: { id: true },
  });

  if (existingChat) return existingChat;

  const chat = await prisma.chat.create({
    data: {
      user: { connect: { id: userId } },
      post: { connect: { id: postId } },
    },
    select: { id: true },
  });
  return chat;
};

export const sendMessageService = async (messageData: MessageType) => {
  const { text, senderId, postId, chatId } = messageData;
  const message = await prisma.message.create({
    data: {
      text: text,
      sender: { connect: { id: senderId } },
      chat: {
        connectOrCreate: {
          where: { id: chatId },
          create: {
            user: { connect: { id: senderId } },
            post: { connect: { id: postId } },
          },
        },
      },
    },
    select: {
      text: true,
      senderId: true,
      chat: {
        select: {
          id: true,
          post: {
            select: {
              id: true,

              owner: { select: { id: true, name: true, surname: true } },
            },
          },
          user: { select: { id: true, name: true, surname: true } },
        },
      },
      created_at: true,
    },
  });
  return message;
};

export const getChatByIdService = async (chatId: string) => {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        select: {
          text: true,
          senderId: true,
          created_at: true,
        },
        orderBy: {
          created_at: "asc",
        },
      },
      post: {
        select: {
          id: true,
          owner: {
            select: {
              id: true,
              name: true,
              surname: true,
              picture: { select: { secureUrl: true } },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          surname: true,
          picture: { select: { secureUrl: true } },
        },
      },
    },
  });
  return chat;
};

export const getChatsByUserService = async (userId: string) => {
  const chats = await prisma.chat.findMany({
    where: { OR: [{ userId }, { post: { ownerId: userId } }] },
    include: {
      post: {
        select: {
          title: true,
          picture: true,
          ownerId: true,
          owner: {
            select: { id: true, name: true, surname: true, picture: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, surname: true, picture: true },
      },
      messages: {
        where: { isRead: false, NOT: { senderId: userId } },
        select: { senderId: true, text: true, created_at: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const lastMessages = await Promise.all(
    chats.map((chat: any) =>
      prisma.message.findFirst({
        where: { chatId: chat.id },
        select: {
          senderId: true,
          chatId: true,
          created_at: true,
          text: true,
        },
        orderBy: { created_at: "desc" },
      }),
    ),
  );

  const result = chats.map((chat, i) => ({
    ...chat,
    lastMessage: lastMessages[i] ?? null,
  }));

  return result;
};
