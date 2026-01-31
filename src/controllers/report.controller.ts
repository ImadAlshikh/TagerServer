import { Request, Response } from "express";
import { reportUserService } from "../services/report.service.js";
import { catchAsync } from "../utils/catchAsync.js";

export const reportUserController = catchAsync(
  async (req: Request, res: Response) => {
    const reportData = req.body;
    const userId = req.session.userId || (req.user as any).id;

    const result = await reportUserService({
      ...reportData,
      reporterId: userId,
    });
    res.status(201).json({ success: true, data: result });
  },
);
