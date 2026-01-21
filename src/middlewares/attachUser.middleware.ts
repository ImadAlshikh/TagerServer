import { NextFunction, Request, Response } from "express";
import redis from "../lib/redis";
import { getUserByIdService } from "../services/user.service";

export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.session.userId || (req.user && (req.user as any).id);
  if (!userId) return next();
  const cached = await redis.get(`user:${userId}`);
  if (cached) {
    req.user = JSON.parse(cached);
    return next();
  }
  const user = await getUserByIdService(userId);
  if (user) {
    await redis.set(
      `user:${userId}`,
      JSON.stringify(user),
      "EX",
      Number(process.env.CACHE_TIME!),
    );
    req.user = user;
  }
  next();
};
