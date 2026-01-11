import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { loadCreditsService } from "../services/creditsService";
import { loadCreditsSchema } from "../utils/validator";

export const loadCreditsController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.session.userId || (req.user as any)?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const validation = loadCreditsSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError("Invalid data: " + validation.error.message, 400);
    }

    const { credits } = validation.data;

    const wallet = await loadCreditsService(userId, credits);

    res.status(200).json({
      success: true,
      data: wallet,
      message: `Successfully added ${credits} credits to your wallet`,
    });
  }
);
