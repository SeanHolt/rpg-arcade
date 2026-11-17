import type { ElementType } from "./schema";

export type GearSlot = "weapon" | "armor" | "helmet" | "boots" | "ring";

export type GearItem = {
  id: string;
  slot: GearSlot;
  name: string;
  bonus: number;
  element?: ElementType;
};

export const SLOT_META: Record<
  GearSlot,
  { icon: string; label: string; statType: "ATK" | "DEF"; perkSummary: string }
> = {
  weapon: {
    icon: "⚔️",
    label: "Weapon",
    statType: "ATK",
    perkSummary: "Elemental Strike (Burn / Freeze / Venom)",
  },
  armor: {
    icon: "🛡️",
    label: "Armor",
    statType: "DEF",
    perkSummary: "Thorns (Reflects +2 dmg when struck)",
  },
  helmet: {
    icon: "🪖",
    label: "Helmet",
    statType: "DEF",
    perkSummary: "Eagle Eye (+1 Ranged attack range)",
  },
  boots: {
    icon: "👢",
    label: "Boots",
    statType: "DEF",
    perkSummary: "Swift Step (15% Dodge chance)",
  },
  ring: {
    icon: "💍",
    label: "Ring",
    statType: "ATK",
    perkSummary: "Vampiric Greed (+3 HP on hit & +50% Gold)",
  },
};

export function getGearSellPrice(item: GearItem): number {
  return Math.max(8, item.bonus * 6);
}
