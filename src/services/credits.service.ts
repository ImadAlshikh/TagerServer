import prisma from "../lib/prisma";
import { stripe } from "../lib/stripe";

export const getPricesService = async () => {
  const prices = await prisma.price.findMany();
  return prices;
};

export const getPackagesService = async () => {
  const packages = await prisma.package.findMany({
    orderBy: { credits: "asc" },
  });

  const packagesWithPrices = await Promise.all(
    packages.map(async (pkg:any) => {
      const price = await stripe.prices.retrieve(pkg.stripePriceId!);
      return {
        ...pkg,
        price: price,
      };
    }),
  );

  return packagesWithPrices;
};

export const getPaymentHistoryService = async (userId: string) => {
  const logs = await prisma.paymentLog.findMany({
    where: {
      wallet: {
        userId: userId,
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return logs;
};
