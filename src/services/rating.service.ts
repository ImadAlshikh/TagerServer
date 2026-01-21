import prisma from "../lib/prisma";
import { RatingType } from "../utils/validator";
import { AppError } from "../utils/AppError";

export const rateUserService = async (ratingData: RatingType) => {
  const { rate, text, raterId, ratedId } = ratingData;
  const isExists = await prisma.rating.findUnique({
    where: { raterId_ratedId: { raterId: raterId, ratedId: ratedId } },
  });
  if (isExists) {
    throw new AppError("This rate already exists", 409);
  }
  const rating = await prisma.rating.create({
    data: {
      rate: rate,
      text: text,
      rater: { connect: { id: raterId } },
      rated: { connect: { id: ratedId } },
    },
  });
  return rating;
};
