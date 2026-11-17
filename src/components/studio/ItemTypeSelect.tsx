"use client";

import type { RpgItemType } from "@/lib/rpg/schema";

type Props = {
  value: RpgItemType;
  onChange: (value: RpgItemType) => void;
  className?: string;
};

export function ItemTypeSelect({ value, onChange, className = "" }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as RpgItemType)}
      className={className}
    >
      <option value="potion">Potion (+HP)</option>
      <option value="weapon">Weapon (+ATK / Element)</option>
      <option value="armor">Armor (+DEF / Thorns)</option>
      <option value="helmet">Helmet (+DEF / +1 Range)</option>
      <option value="boots">Boots (+DEF / Dodge)</option>
      <option value="ring">Ring (+ATK / Lifesteal)</option>
    </select>
  );
}
