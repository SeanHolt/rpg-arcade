"use client";

import type { PlayerRuntimeState } from "@/lib/rpg/runtime-types";
import {
  getGearSellPrice,
  SLOT_META,
  type GearItem,
  type GearSlot,
} from "@/lib/rpg/gear-perks";
import { elementBadge } from "@/lib/rpg/elemental-helpers";

type Props = {
  player: PlayerRuntimeState;
  gearBag: GearItem[];
  onEquip: (id: string) => void;
  onSell: (id: string) => void;
};

const ALL_SLOTS: GearSlot[] = ["weapon", "armor", "helmet", "boots", "ring"];

export function EquipmentPanel({ player, gearBag, onEquip, onSell }: Props) {
  const equipped = player.equippedGear ?? {};

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
      <h3 className="font-semibold uppercase tracking-wider text-zinc-400">
        Equipment Slots (5)
      </h3>

      <div className="space-y-1.5">
        {ALL_SLOTS.map((slot) => {
          const meta = SLOT_META[slot];
          const item = equipped[slot];
          return (
            <div
              key={slot}
              title={meta.perkSummary}
              className="rounded-lg bg-zinc-950 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">
                  {meta.icon} {meta.label}:
                </span>
                <span className="font-medium text-zinc-200">
                  {item ? (
                    <>
                      {item.name} {elementBadge(item.element)} (+{item.bonus}{" "}
                      {meta.statType})
                    </>
                  ) : (
                    <span className="text-zinc-600">Empty</span>
                  )}
                </span>
              </div>
              {item && (
                <div className="mt-0.5 text-[11px] text-emerald-400/90">
                  ✦ {meta.perkSummary}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {gearBag.length > 0 && (
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="mb-1.5 text-zinc-400">Gear Bag ({gearBag.length})</div>
          <div className="space-y-1.5">
            {gearBag.map((item) => {
              const meta = SLOT_META[item.slot];
              const sellPrice = getGearSellPrice(item);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded bg-zinc-950 px-2.5 py-1.5"
                >
                  <div className="min-w-0 truncate text-zinc-300">
                    {meta.icon} {item.name} {elementBadge(item.element)} (+{item.bonus}{" "}
                    {meta.statType})
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEquip(item.id)}
                      className="rounded bg-emerald-950/80 px-2 py-0.5 text-emerald-300 hover:bg-emerald-900"
                    >
                      Equip
                    </button>
                    <button
                      type="button"
                      onClick={() => onSell(item.id)}
                      className="rounded bg-amber-950/80 px-2 py-0.5 text-amber-300 hover:bg-amber-900"
                    >
                      Sell ({sellPrice}g)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
