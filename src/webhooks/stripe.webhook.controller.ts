import { Request, Response } from "express";
import { stripe } from "../lib/stripe.js";
import { AppError } from "../utils/AppError.js";
import { prisma } from "../lib/prisma.js";
import env from "../lib/env.js";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      env.stripe.webhookSecret,
    );

    switch (event.type) {
      case "checkout.session.completed":
        console.log("completed");
        const userId = event.data.object.metadata?.userId;
        const packageId = event.data.object.metadata?.packageId;
        const amount = event.data.object.amount_total;
        if (!userId || !packageId) {
          throw new AppError("Invalid required metadata", 400);
        }
        const userWallet = await prisma.wallet.upsert({
          where: { userId: userId },
          update: {},
          create: {
            userId: userId,
          },
        });
        const packageCredits = (
          await prisma.package.findUnique({
            where: { id: packageId },
            select: { credits: true },
          })
        )?.credits;

        const res = await prisma.$transaction(async (tx: any) => {
          await tx.paymentLog.create({
            data: {
              walletId: userWallet.id,
              amount: packageCredits!,
              pointSource: "PAID",
              reason: "TOP_UP",
            },
          });
          return await tx.wallet.update({
            where: { userId: userId },
            data: {
              paidPoints: { increment: packageCredits! },
            },
          });
        });
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Invalid stripe signature:", error);
    return res.sendStatus(400);
  }
}
