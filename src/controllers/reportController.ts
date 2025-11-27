import { Request, Response } from "express";
import { reportUserService } from "../services/reportService";

export const reportUserController = async (req: Request, res: Response) => {
  try {
    const reportData = req.body;
    const result = await reportUserService(reportData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
