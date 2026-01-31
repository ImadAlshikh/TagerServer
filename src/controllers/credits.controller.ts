import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import {
  getPackagesService,
  getPaymentHistoryService,
  getPricesService,
} from "../services/credits.service.js";

export const getPricesController = catchAsync(
  async (req: Request, res: Response) => {
    const prices = await getPricesService();
    res.status(200).json({ success: true, data: prices });
  },
);

export const getPackagesController = catchAsync(
  async (req: Request, res: Response) => {
    const packages = await getPackagesService();

    res.status(200).json({
      success: true,
      data: packages,
    });
  },
);

export const getPaymentHistoryController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.session.userId || (req.user as any)?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const history = await getPaymentHistoryService(userId);

    res.status(200).json({
      success: true,
      data: history,
    });
  },
);
