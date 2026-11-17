"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { getBillingProduct } from "@/lib/billing-catalog";
import { getStripeClient } from "@/lib/stripe";

export async function createCheckoutSession(productId: string) {
  if (!(await isFeatureEnabled("billing_enabled"))) {
    return { error: "Store purchases are temporarily disabled for maintenance." };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: "Please log in before making a purchase." };
  }

  const product = getBillingProduct(productId);
  if (!product) {
    return { error: "Invalid product selected." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, isPro: true },
  });
  if (!user) return { error: "User account not found." };

  if (product.grantsPro && user.isPro) {
    return { error: "Your account already has Creator Pro unlocked!" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const stripe = getStripeClient();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: product.priceCents,
            product_data: {
              name: product.title,
              description: product.subtitle,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        productId: product.id,
      },
      success_url: `${appUrl}/billing?success=1`,
      cancel_url: `${appUrl}/billing?canceled=1`,
    });

    if (!checkout.url) {
      return { error: "Unable to create Stripe Checkout URL." };
    }
    return { url: checkout.url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe configuration error.";
    return { error: msg };
  }
}
