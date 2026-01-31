import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export const reportUserService = async ({
  reporterId,
  reportedId,
  text,
}: {
  reporterId: string;
  reportedId: string;
  text?: string;
}) => {
  const isExists = await prisma.report.findUnique({
    where: {
      reporterId_reportedId: {
        reporterId: reporterId,
        reportedId: reportedId,
      },
    },
  });
  if (isExists) throw new AppError("Report from this user already exists", 409);
  const report = await prisma.report.create({
    data: {
      reporterId: reporterId,
      reportedId: reportedId,
      text: text,
    },
  });
  return report;
};
