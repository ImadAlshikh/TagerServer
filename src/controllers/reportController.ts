import { Request, Response } from "express";
import { reportUserService } from "../services/reportService";
import { catchAsync } from "../utils/catchAsync";

export const reportUserController = catchAsync(
  async (req: Request, res: Response) => {
    const reportData = req.body;
    const result = await reportUserService(reportData);
    res.status(201).json({ success: true, data: result });
  }
);
