import { Request, Response } from "express";
import { ratingSchema, RatingType } from "../utils/validator";
import { rateUserService } from "../services/rating.service";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const rateUserController = catchAsync(
  async (req: Request, res: Response) => {
    const ratingData: RatingType = {
      ...req.body,
      raterId: (req.user as any).id,
    };

    const ratingDataValid = ratingSchema.safeParse(ratingData);
    if (!ratingDataValid.success) {
      throw new AppError("Invalid rating data", 400);
    }
    const rating = await rateUserService(ratingDataValid.data);
    return res.status(200).json({ success: true, data: rating });
  }
);
