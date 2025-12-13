import { NextFunction, Request, Response } from "express";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId && !(req.user as any).id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  next();
};
