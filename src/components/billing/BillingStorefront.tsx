"use client";

import { useState, useTransition } from "react";
import { createCheckoutSession } from "@/actions/billing";
import { BILLING_PRODUCTS } from "@/lib/billing-catalog";

type Props = {
  isLoggedIn: boolean;
  coins: number;
  isPro: boolean;
  banner?: "success" | "canceled";
};

export function BillingStorefront({ isLoggedIn, coins, isPro, banner }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleBuy = (productId: string) => {
    setError(null);
    setActiveId(productId);
    startTransition(async () => {
      const res = await createCheckoutSession(productId);
      if (res.error) {
        setError(res.error);
        setActiveId(null);
        return;
      }
      if (res.url) {
        window.location.href = res.url;
      }
    });
  };

  return (
    <div className="space-y-6">
      {banner === "success" && (
        <div className="rounded-xl border border-emerald-700 bg-emerald-950/60 p-4 text-xs text-emerald-200">
          🎉 Payment successful! Your Arcade Coins and/or Creator Pro status have been applied to your account.
        </div>
      )}

      {banner === "canceled" && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-xs text-zinc-300">
          Checkout was canceled—no charges were made.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Arcade Coin Store &amp; Creator Pro</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Top up Arcade Coins for the Pixel Art Marketplace or upgrade to Creator Pro for bigger dungeons.
          </p>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-2">
            {isPro && (
              <span className="rounded-xl border border-amber-500/60 bg-amber-950/60 px-3 py-2 text-xs font-bold text-amber-300">
                👑 CREATOR PRO
              </span>
            )}
            <div className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs font-bold text-amber-300">
              🪙 {coins} Coins
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-800 bg-red-950/70 p-3 text-xs text-red-200">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {BILLING_PRODUCTS.map((item) => {
          const alreadyPro = item.grantsPro && isPro;
          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-2xl border p-6 ${
                item.grantsPro
                  ? "border-amber-600/60 bg-linear-to-br from-amber-950/30 via-zinc-900 to-zinc-900"
                  : "border-zinc-800 bg-zinc-900/70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-zinc-100">{item.title}</span>
                  {item.badge && (
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{item.subtitle}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
                <span className="text-lg font-extrabold text-zinc-100">{item.priceLabel}</span>
                <button
                  type="button"
                  disabled={!isLoggedIn || alreadyPro || isPending}
                  onClick={() => handleBuy(item.id)}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-45"
                >
                  {!isLoggedIn
                    ? "Log in to Buy"
                    : alreadyPro
                      ? "✓ Pro Unlocked"
                      : isPending && activeId === item.id
                        ? "Redirecting..."
                        : "Checkout with Stripe"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
