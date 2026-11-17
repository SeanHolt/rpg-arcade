export type BillingProduct = {
  id: "coins_500" | "coins_1500" | "coins_4000" | "creator_pro_lifetime";
  title: string;
  subtitle: string;
  priceCents: number;
  priceLabel: string;
  coinsGranted: number;
  grantsPro: boolean;
  badge?: string;
};

export const BILLING_PRODUCTS: BillingProduct[] = [
  {
    id: "coins_500",
    title: "Pouch of 500 Arcade Coins",
    subtitle: "Unlock several community pixel-art sprite packs right away.",
    priceCents: 199,
    priceLabel: "$1.99",
    coinsGranted: 500,
    grantsPro: false,
  },
  {
    id: "coins_1500",
    title: "Chest of 1,500 Arcade Coins",
    subtitle: "Great value for building multi-theme dungeon campaigns.",
    priceCents: 499,
    priceLabel: "$4.99",
    coinsGranted: 1500,
    grantsPro: false,
    badge: "POPULAR",
  },
  {
    id: "coins_4000",
    title: "Vault of 4,000 Arcade Coins",
    subtitle: "Massive coin stash for serious asset collectors.",
    priceCents: 999,
    priceLabel: "$9.99",
    coinsGranted: 4000,
    grantsPro: false,
  },
  {
    id: "creator_pro_lifetime",
    title: "👑 Creator Pro Pass (+500 Bonus Coins)",
    subtitle: "Unlocks 30 floors/dungeon, 12 Hero Classes, Gold PRO badge, and +500 Coins.",
    priceCents: 799,
    priceLabel: "$7.99 One-Time",
    coinsGranted: 500,
    grantsPro: true,
    badge: "CREATOR PRO",
  },
];

export function getBillingProduct(id: string): BillingProduct | undefined {
  return BILLING_PRODUCTS.find((p) => p.id === id);
}
