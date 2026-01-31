import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId && !(req.user as any)?.id) {
    return res
      .status(403)
      .json({ success: false, data: { message: "Unauthorized" } });
  }
  next();
};
