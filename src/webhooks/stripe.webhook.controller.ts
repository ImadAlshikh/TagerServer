import { Request, Response } from "express";
import { stripe } from "../lib/stripe";
import { AppError } from "../utils/AppError";
import prisma from "../lib/prisma";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  console.log("sig:", sig);
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env.STRIPE_SIG!,
    );
    console.log("event type:", event.type);
    switch (event.type) {
      case "checkout.session.completed":
        console.log("completed");
        const userId = event.data.object.metadata?.userId;
        const packageId = event.data.object.metadata?.packageId;
        const amount = event.data.object.amount_total;
        console.log(userId, packageId);
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

        const res = await prisma.$transaction(async (tx) => {
          await tx.paymentLog.create({
            data: {
              walletId: userWallet.id,
              amount: amount!,
              packageId: packageId,
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
