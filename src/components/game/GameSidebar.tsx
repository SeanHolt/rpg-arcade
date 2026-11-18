"use client";

import type {
  ActiveEnemy,
  ActiveQuestProgress,
  GearItem,
  PlayerRuntimeState,
  PotionItem,
} from "@/lib/rpg/runtime-types";
import { elementBadge } from "@/lib/rpg/elemental-helpers";
import { EquipmentPanel } from "./EquipmentPanel";
import { QuestTrackerCard } from "./QuestTrackerCard";
import { StatusBadges } from "./StatusBadges";

type Props = {
  player: PlayerRuntimeState;
  enemies: ActiveEnemy[];
  potions: PotionItem[];
  gearBag: GearItem[];
  activeQuests: ActiveQuestProgress[];
  logs: string[];
  onUsePotion: (id: string) => void;
  onEquipGear: (id: string) => void;
  onSellGear: (id: string) => void;
};

export function GameSidebar({
  player,
  enemies,
  potions,
  gearBag,
  activeQuests,
  logs,
  onUsePotion,
  onEquipGear,
  onSellGear,
}: Props) {
  const hpPct = Math.max(0, Math.min(100, Math.round((player.hp / player.maxHp) * 100)));

  return (
    <aside className="space-y-4">
      <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-zinc-100">{player.name}</h2>
            <p className="text-xs text-zinc-400">
              Lv.{player.level} {player.className} ({player.combatType === "ranged" ? `Range ${player.range}` : "Melee"})
            </p>
          </div>
          <span className="rounded bg-amber-950/60 px-2.5 py-1 text-xs font-bold text-amber-300">
            💰 {player.gold}g
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>HP</span>
            <span>
              {player.hp} / {player.maxHp}
            </span>
          </div>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${hpPct}%` }} />
          </div>
          <StatusBadges statuses={player.statuses} />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
          <div className="rounded-lg bg-zinc-950 p-2">
            <div className="text-zinc-500">ATK</div>
            <div className="font-bold text-zinc-100">{player.atk}</div>
          </div>
          <div className="rounded-lg bg-zinc-950 p-2">
            <div className="text-zinc-500">DEF</div>
            <div className="font-bold text-zinc-100">{player.def}</div>
          </div>
          <div className="rounded-lg bg-zinc-950 p-2">
            <div className="text-zinc-500">XP</div>
            <div className="font-bold text-zinc-100">
              {player.xp}/{player.level * 50}
            </div>
          </div>
        </div>
      </div>

      <EquipmentPanel
        player={player}
        gearBag={gearBag}
        onEquip={onEquipGear}
        onSell={onSellGear}
      />

      <QuestTrackerCard quests={activeQuests} />

      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
        <h3 className="font-semibold uppercase tracking-wider text-zinc-400">
          Potions ({potions.length})
        </h3>
        {potions.length === 0 ? (
          <p className="text-zinc-500">No potions in bag.</p>
        ) : (
          <div className="space-y-1.5">
            {potions.map((pot) => (
              <div
                key={pot.id}
                className="flex items-center justify-between rounded bg-zinc-950 px-2.5 py-1.5"
              >
                <span className="text-zinc-300">
                  🧪 {pot.name} (+{pot.healAmount} HP)
                </span>
                <button
                  type="button"
                  onClick={() => onUsePotion(pot.id)}
                  className="rounded bg-emerald-950/80 px-2 py-0.5 font-semibold text-emerald-300 hover:bg-emerald-900"
                >
                  Drink
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
        <h3 className="font-semibold uppercase tracking-wider text-zinc-400">
          Enemies on Floor ({enemies.length})
        </h3>
        {enemies.length === 0 ? (
          <p className="text-zinc-500">Floor cleared!</p>
        ) : (
          <div className="space-y-1.5">
            {enemies.map((enemy) => (
              <div key={enemy.id} className="rounded bg-zinc-950 px-2.5 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-200">
                    {enemy.sprite} {enemy.name} {elementBadge(enemy.element)}
                    {enemy.isBoss ? " 👑" : ""}
                  </span>
                  <span className="text-zinc-400">
                    {enemy.currentHp}/{enemy.hp} HP
                  </span>
                </div>

                {enemy.isChargingSpecial && enemy.specialAttack && (
                  <div className="mt-1 animate-pulse rounded border border-amber-500/70 bg-amber-950/70 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                    ⚠️ CHARGING: {enemy.specialAttack.name} ({enemy.specialAttack.multiplier}x DMG)
                  </div>
                )}

                <StatusBadges statuses={enemy.statuses} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
        <h3 className="font-semibold uppercase tracking-wider text-zinc-400">Adventure Log</h3>
        <div className="max-h-40 space-y-1 overflow-y-auto text-zinc-300">
          {logs.map((entry, idx) => (
            <p key={idx} className="leading-relaxed">
              • {entry}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}
