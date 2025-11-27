import prisma from "../lib/prisma";

export const reportUserService = async (reportData: any) => {
  try {
    const isExists = await prisma.report.findFirst({
      where: {
        reporterId: reportData.rerporterId,
        reportedId: reportData.reportedId,
      },
    });
    if (isExists) throw new Error("Report from user is already exists");
    const report = await prisma.report.create({
      data: {
        reporter: { connect: { id: reportData.reporterdId } },
        reportedId: reportData.reportedId,
        text: reportData.text,
      },
    });
    return report;
  } catch (error) {
    throw new Error("Report failed");
  }
};
