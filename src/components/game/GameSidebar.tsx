"use client";

import type { ActiveEnemy, GearItem, PlayerRuntimeState, PotionItem } from "@/store/useGameStore";
import { EquipmentPanel } from "./EquipmentPanel";
import { SpriteDisplay } from "./SpriteDisplay";
import { ActiveQuestProgress } from "@/lib/rpg/runtime-types";
import { QuestTrackerCard } from "./QuestTrackerCard";
import { StatusBadges } from "./StatusBadges";
import { elementBadge } from "@/lib/rpg/elemental-helpers";

type Props = {
    player: PlayerRuntimeState;
    enemies: ActiveEnemy[];
    potions: PotionItem[];
    gearBag: GearItem[];
    logs: string[];
    activeQuests: ActiveQuestProgress[];
    onUsePotion: (id: string) => void;
    onEquipGear: (id: string) => void;
    onSellGear: (id: string) => void;
};

export function GameSidebar({ player, enemies, potions, gearBag, logs, activeQuests, onUsePotion, onEquipGear, onSellGear }: Props) {
    const hpPercent = Math.max(0, Math.round((player.hp / player.maxHp) * 100));

    return (
        <aside className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-semibold text-zinc-100">
                            <SpriteDisplay sprite={player.sprite} /> {player.name}
                        </div>
                        <div className="text-xs text-zinc-400">
                            {player.className} •{" "}
                            {player.combatType === "ranged" ? `Ranged (${player.range})` : "Melee"}
                        </div>
                    </div>
                    <span className="rounded bg-emerald-950 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                        Lv. {player.level}
                    </span>
                </div>

                <div className="mt-3">
                    <div className="flex justify-between text-xs text-zinc-400">
                        <span>HP</span>
                        <span>
                            {player.hp} / {player.maxHp}
                        </span>
                    </div>
                    <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-150"
                            style={{ width: `${hpPercent}%` }}
                        />
                        <StatusBadges statuses={player.statuses} />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-1.5 text-center text-xs">
                    <div className="rounded-lg bg-zinc-950 p-2">
                        <div className="text-zinc-500">ATK</div>
                        <div className="mt-0.5 font-bold text-zinc-200">{player.atk}</div>
                    </div>
                    <div className="rounded-lg bg-zinc-950 p-2">
                        <div className="text-zinc-500">DEF</div>
                        <div className="mt-0.5 font-bold text-zinc-200">{player.def}</div>
                    </div>
                    <div className="rounded-lg bg-zinc-950 p-2">
                        <div className="text-amber-500">GOLD</div>
                        <div className="mt-0.5 font-bold text-amber-300">{player.gold}g</div>
                    </div>
                    <div className="rounded-lg bg-zinc-950 p-2">
                        <div className="text-zinc-500">XP</div>
                        <div className="mt-0.5 font-bold text-zinc-200">
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
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Potions ({potions.length})
                </h3>
                {potions.length === 0 ? (
                    <p className="mt-2 text-xs text-zinc-500">No potions in bag.</p>
                ) : (
                    <div className="mt-2 space-y-1.5">
                        {potions.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => onUsePotion(p.id)}
                                className="flex w-full items-center justify-between rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-900/50"
                            >
                                <span>🧪 {p.name}</span>
                                <span className="font-semibold">+{p.healAmount} HP</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Enemies on Floor ({enemies.length})
                </h3>
                {enemies.length === 0 ? (
                    <p className="mt-2 text-xs text-zinc-500">All enemies defeated.</p>
                ) : (
                    <ul className="mt-2 space-y-1.5 text-xs">
                        {enemies.map((enemy) => (
                            <li
                                key={enemy.id}
                                className="flex items-center justify-between rounded bg-zinc-950 px-2.5 py-1.5"
                            >
                                <span>
                                    <SpriteDisplay sprite={enemy.sprite} /> {enemy.name} {elementBadge(enemy.element)} {enemy.isBoss ? "(BOSS)" : ""}
                                </span>
                                <span className="font-mono text-zinc-400">
                                    {enemy.currentHp}/{enemy.hp} HP
                                </span>
                                <StatusBadges statuses={enemy.statuses} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Adventure Log
                </h3>
                <div className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1 text-xs text-zinc-300">
                    {logs.map((entry, idx) => (
                        <p
                            key={idx}
                            className={idx === 0 ? "font-medium text-zinc-100" : "text-zinc-400"}
                        >
                            {entry}
                        </p>
                    ))}
                </div>
            </div>
        </aside>
    );
}
