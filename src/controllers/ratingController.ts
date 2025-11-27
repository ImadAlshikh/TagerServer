import { Request, Response } from "express";
import { ratingSchema, RatingType } from "../utils/validator";
import { rateUserService } from "../services/ratingService";

export const rateUserController = async (req: Request, res: Response) => {
  try {
    const ratingData: RatingType = {
      ...req.body,
      raterId: (req.user as any).id,
    };

    const ratingDataValid = ratingSchema.safeParse(ratingData);
    if (!ratingDataValid.success) {
      return res.status(401).json({ sucess: false, message: "Invalid data" });
    }
    const rating = await rateUserService(ratingDataValid.data);
    return res.status(200).json({ success: true, data: rating });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
