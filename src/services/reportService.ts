import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

export const reportUserService = async (reportData: any) => {
  const isExists = await prisma.report.findFirst({
    where: {
      reporterId: reportData.rerporterId,
      reportedId: reportData.reportedId,
    },
  });
  if (isExists) throw new AppError("Report from this user already exists", 409);
  const report = await prisma.report.create({
    data: {
      reporter: { connect: { id: reportData.reporterdId } },
      reportedId: reportData.reportedId,
      text: reportData.text,
    },
  });
  return report;
};
