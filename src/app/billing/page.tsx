import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { FeatureDisabledBanner } from "@/components/game/FeatureDisabledBanner";
import { BillingStorefront } from "@/components/billing/BillingStorefront";

type BillingPageProps = {
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

async function BillingLoader({ searchParams }: BillingPageProps) {
  await connection();
  if (!(await isFeatureEnabled("billing_enabled"))) {
    return <FeatureDisabledBanner featureName="Coin Store & Creator Pro" />;
  }

  const [session, params] = await Promise.all([auth(), searchParams]);
  const userId = session?.user?.id;

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { coins: true, isPro: true },
      })
    : null;

  const banner =
    params.success === "1" ? "success" : params.canceled === "1" ? "canceled" : undefined;

  return (
    <BillingStorefront
      isLoggedIn={Boolean(userId)}
      coins={user?.coins ?? 0}
      isPro={Boolean(user?.isPro)}
      banner={banner}
    />
  );
}

export default function BillingPage({ searchParams }: BillingPageProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-zinc-900" />}>
        <BillingLoader searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
