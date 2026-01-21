import { stripe } from "../lib/stripe";
import { PackageType } from "../utils/validator";
export async function createCheckoutSession({
  user,
  pckg,
}: {
  user: { id: string; email: string; name: string; surname: string | null };
  pckg: any;
}) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,

    metadata: {
      userId: user.id,
      packageId: pckg.id,
    },
    line_items: [
      {
        quantity: 1,
        price: pckg.stripePriceId,
        // price_data: {
        //   currency: "usd",
        //   product_data: {
        //     name: pckg.name,
        //     ...(pckg.description && { description: pckg.description }),
        //   },
        // },
      },
    ],
    success_url: `${process.env.FRONT_URL}/profile`,
    cancel_url: `${process.env.FRONT_URL}/pricing`,
  });
}
