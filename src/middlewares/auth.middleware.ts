import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export const isAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.session?.userId && !(req.user as any)?.id) {
    return next(new AppError("Unauthorized", 403));
  }
  next();
};
