import { Request, Response } from "express";
import { createCheckoutSession } from "../services/stripe.service";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

export async function createCheckout(req: Request, res: Response) {
  const packageId = req.body.packageId;
  const pckg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pckg) throw new AppError("Package not found", 404);
  const userId = req.session.userId || (req.user as any)?.id;
  console.log("userId", userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
    },
  });

  if (!user) throw new AppError("unauthorized", 403);
  const session = await createCheckoutSession({ user, pckg: pckg });
  res.json({ success: true, data: session.url });
}
