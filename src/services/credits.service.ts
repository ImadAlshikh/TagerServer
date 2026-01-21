import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

export const getPackagesService = async () => {
  const packages = await prisma.package.findMany({
    orderBy: { price: "asc" },
  });
  return packages;
};

export const loadCreditsService = async (userId: string, credits: number) => {
  if (credits <= 0) {
    throw new AppError("Credits amount must be positive", 400);
  }

  const wallet = await prisma.$transaction(async (tx: any) => {
    // Get or create wallet
    const userWallet = await tx.wallet.upsert({
      where: { userId },
      create: {
        user: { connect: { id: userId } },
        paidPoints: credits,
      },
      update: {
        paidPoints: { increment: credits },
      },
    });

    // Create wallet log
    // await tx.paymentLog.create({
    //   data: {
    //     wallet: { connect: { id: userWallet.id } },
    //     amount: credits,
    //     pointSource: "PAID",
    //     reason: "TOP_UP",
    //   },
    // });

    // Return updated wallet
    return tx.wallet.findUnique({
      where: { id: userWallet.id },
      include: {
        logs: {
          orderBy: { created_at: "desc" },
          take: 10,
        },
      },
    });
  });

  return wallet;
};
