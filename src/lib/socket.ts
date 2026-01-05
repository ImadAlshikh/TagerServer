import { Server } from "socket.io";
import prisma from "./prisma";

export let io: Server;
export function InitSocket(server: any) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  });
  io.on("connection", (socket) => {
    console.log("connected");
    socket.on("join-chat", async ({ chatId, userId }) => {
      console.log("joined:");
      socket.join(chatId);
      await prisma.message.updateMany({
        where: { chatId, NOT: { senderId: userId }, isRead: false },
        data: { isRead: true },
      });
    });
    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId);
    });
  });
  return io;
}
