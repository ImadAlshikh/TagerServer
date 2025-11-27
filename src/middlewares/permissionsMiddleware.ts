import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { type userRoles } from "../utils/validator";

type Role = (typeof userRoles)[number];
type RoleOrRoles = Role | Role[];

export const checkPermissions = (allowRoles?: RoleOrRoles) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const userId = (req.user as any).id;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      if (allowRoles?.length && !allowRoles?.includes(user!.role)) {
        return res.status(401).json({ message: "Permission not allowed" });
      }
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
};
