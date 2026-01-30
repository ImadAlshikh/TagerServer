import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { type userRoles } from "../utils/validator";
import { AppError } from "../utils/AppError";

type Role = (typeof userRoles)[number];
type RoleOrRoles = Role | Role[];

export const checkPermissions = (allowRoles?: RoleOrRoles) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated()) {
        throw new AppError("Unauthorized", 401);
      }
      const userId = (req.user as any).id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!user) {
        throw new AppError("Unauthorized", 401);
      }
      if (allowRoles?.length && !allowRoles?.includes(user!.role)) {
        throw new AppError("Permission not allowed", 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
