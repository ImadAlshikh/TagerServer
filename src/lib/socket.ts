import { Server } from "socket.io";
import { prisma } from "./prisma.js";
import { AppError } from "../utils/AppError.js";

export let io: Server;
export function InitSocket(server: any, sessionMiddleware: any) {
  io = new Server(server, { cors: { origin: "*" } });
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });
  io.use((socket, next) => {
    const userId =
      socket.request?.session?.userId ||
      socket.request?.session?.passport?.user;
    if (!userId) return;
    next();
  });
  io.on("connection", (socket) => {
    socket.on("join-chat", async ({ chatId, userId }) => {
      socket.join(chatId);
      await prisma.message.updateMany({
        where: { chatId, NOT: { senderId: userId }, isRead: false },
        data: { isRead: true },
      });
    });
    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId);
    });
    socket.on("subscribe-notification", (userId) => {
      socket.join(`user:${userId}`);
    });
  });
  return io;
}
