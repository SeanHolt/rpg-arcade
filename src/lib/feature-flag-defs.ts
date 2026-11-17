export const FEATURE_FLAG_DEFS = [
  {
    key: "endless_mode",
    label: "♾️ Endless Dungeon Mode",
    description: "Enables the procedural infinite dungeon mode at /endless.",
    defaultEnabled: true,
  },
  {
    key: "marketplace",
    label: "🎨 Creator Asset Marketplace",
    description:
      "Enables /marketplace, publishing pixel art packs, and coin purchases.",
    defaultEnabled: true,
  },
  {
    key: "coin_rewards",
    label: "🪙 Dungeon Clear Coin Rewards",
    description:
      "Awards Arcade Coins when players defeat dungeon bosses or Endless depths.",
    defaultEnabled: true,
  },
  {
    key: "mid_run_saves",
    label: "💾 Mid-Run Save & Resume",
    description:
      "Enables saving and resuming active runs in community dungeons and Endless Mode.",
    defaultEnabled: true,
  },
  {
    key: "social_follows",
    label: "★ Creator Profiles & Following",
    description:
      "Enables /creator/[id] profiles, Follow buttons, and the Following feed filter.",
    defaultEnabled: true,
  },
  {
    key: "class_skills",
    label: "⚡ Signature Class Skills [Q]",
    description:
      "Allows heroes to trigger active [Q] class abilities in combat.",
    defaultEnabled: true,
  },
  {
    key: "elemental_effects",
    label: "🔥 Elemental Damage & Statuses",
    description:
      "Enables Fire (Burn), Ice (Freeze), and Venom (Poison) combat procs.",
    defaultEnabled: true,
  },
  {
    key: "npc_interactions",
    label: "💬 NPCs, Merchants & Quests",
    description:
      "Enables talking to NPCs, buying from dungeon merchants, and side quests.",
    defaultEnabled: true,
  },
  {
    key: "billing_enabled",
    label: "💳 Stripe Coin Top-Ups & Creator Pro",
    description:
      "Enables /billing, Stripe Checkout Coin Packs, and Creator Pro upgrades.",
    defaultEnabled: true,
  },
] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_DEFS)[number]["key"];
export type FeatureFlagsMap = Record<FeatureFlagKey, boolean>;

export function getDefaultFeatureFlags(): FeatureFlagsMap {
  return Object.fromEntries(
    FEATURE_FLAG_DEFS.map((f) => [f.key, f.defaultEnabled]),
  ) as FeatureFlagsMap;
}
