import { Server } from "socket.io";
import prisma from "./prisma";

export let io: Server;
export function InitSocket(server: any) {
  io = new Server(server, { cors: { origin: "*" } });
  io.on("connection", (socket) => {
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
    socket.on("subscribe-notification", (userId) =>
      {socket.join(`user:${userId}`)}
    );
  });
  return io;
}
