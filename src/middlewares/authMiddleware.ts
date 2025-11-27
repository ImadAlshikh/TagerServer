import { NextFunction, Request, Response } from "express";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated())
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  next();
};
