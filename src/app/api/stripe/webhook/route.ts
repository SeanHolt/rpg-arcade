import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
import { getBillingProduct } from "@/lib/billing-catalog";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook signature or secret." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const productId = session.metadata?.productId;

    if (!userId || !productId || session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const product = getBillingProduct(productId);
    if (!product) {
      return NextResponse.json({ received: true });
    }

    // Idempotency guard: skip if this Stripe session was already fulfilled
    const existing = await prisma.stripePayment.findUnique({
      where: { stripeSessionId: session.id },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ received: true });
    }

    await prisma.$transaction([
      prisma.stripePayment.create({
        data: {
          stripeSessionId: session.id,
          userId,
          productId: product.id,
          amountCents: session.amount_total ?? product.priceCents,
          coinsGranted: product.coinsGranted,
          grantedPro: product.grantsPro,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: product.coinsGranted },
          ...(product.grantsPro ? { isPro: true } : {}),
          ...(typeof session.customer === "string" ? { stripeCustomerId: session.customer } : {}),
        },
      }),
    ]);
  }

  return NextResponse.json({ received: true });
}
