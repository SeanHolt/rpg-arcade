"use client";

import type { RpgFloor } from "@/lib/rpg/schema";
import type { ActiveEnemy, PlayerRuntimeState } from "@/lib/rpg/runtime-types";
import { DUNGEON_THEMES, type ThemeId } from "@/lib/rpg/themes";
import { SpriteDisplay } from "./SpriteDisplay";
import type { RpgBlueprint, RpgChest, RpgNpc } from "@/lib/rpg/schema";

type Props = {
    floor: RpgFloor;
    player: PlayerRuntimeState;
    enemies: ActiveEnemy[];
    usedShrines: string[];
    openedChests: string[];
    exploredTiles: string[];
    fogOfWar: boolean;
    visionRadius: number;
    themeId?: ThemeId;
    customSprites?: RpgBlueprint["customSprites"];
    onMove: (dx: number, dy: number) => void;
    onRangedAttack: (enemyId?: string) => void;
    onUseSkill: () => void;
};

export function DungeonGrid({
    floor,
    player,
    enemies,
    usedShrines,
    openedChests,
    exploredTiles,
    fogOfWar,
    visionRadius,
    themeId = "crypt",
    customSprites = {},
    onMove,
    onRangedAttack,
    onUseSkill,
}: Props) {
    const width = floor.grid.at(0)?.length ?? 10;
    const theme = DUNGEON_THEMES[themeId] ?? DUNGEON_THEMES.crypt;

    return (
        <div className="flex flex-col items-center">
            <div
                className="grid gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-2"
                style={{
                    gridTemplateColumns: `repeat(${width}, minmax(2.25rem, 2.5rem))`,
                }}
            >
                {floor.grid.map((row, y) =>
                    row.split("").map((tile, x) => {
                        const dist = Math.abs(player.x - x) + Math.abs(player.y - y);
                        const inSight = !fogOfWar || dist <= visionRadius + 1;
                        const isExplored = !fogOfWar || exploredTiles.includes(`${floor.id}:${x},${y}`);

                        if (!isExplored) {
                            return (
                                <div
                                    key={`${x}-${y}`}
                                    className="flex h-9 w-9 items-center justify-center rounded bg-black"
                                />
                            );
                        }

                        const isPlayer = player.x === x && player.y === y;
                        const enemy = enemies.find((e) => e.x === x && e.y === y);
                        const chest = (floor.chests ?? []).find((c) => c.x === x && c.y === y);
                        const shrineUsed = usedShrines.includes(`${floor.id}:${x},${y}`);
                        const targetable =
                            Boolean(enemy) && inSight && player.combatType === "ranged" && dist <= player.range;
                        const npc = (floor.npcs ?? []).find((n) => n.x === x && n.y === y);

                        let bg = theme.floorBg;
                        let content: React.ReactNode = customSprites.floor ? (
                            <SpriteDisplay sprite={customSprites.floor} sizeClass="h-8 w-8" />
                        ) : null;

                        if (tile === "#") {
                            bg = theme.wallBg;
                            content = customSprites.wall ? (
                                <SpriteDisplay sprite={customSprites.wall} sizeClass="h-8 w-8" />
                            ) : null;
                        } else if (tile === "S") {
                            bg = theme.stairsBg;
                            content = (
                                <SpriteDisplay
                                    sprite={customSprites.stairs ?? theme.stairsIcon}
                                    sizeClass="h-7 w-7"
                                    textClass="text-sm"
                                />
                            );
                        } else if (tile === "H") {
                            bg = shrineUsed ? "bg-zinc-800/60" : theme.shrineBg;
                            content = (
                                <span className={shrineUsed ? "opacity-30" : ""}>
                                    {!enemy && !chest && !npc && tile === "H" && !usedShrines.includes(`${floor.id}:${x},${y}`) && (
                                        <SpriteDisplay
                                            sprite={customSprites?.shrine ?? "✨"}
                                            frame2={customSprites?.shrineFrame2}
                                            alt="Shrine"
                                        />
                                    )}
                                </span>
                            );
                        }

                        if (chest) {
                            const isOpened = openedChests.includes(chest.id);
                            content = isOpened ? (
                                <span className="text-sm opacity-50">📭</span>
                            ) : (
                                <SpriteDisplay
                                    sprite={customSprites.chest ?? theme.chestIcon}
                                    sizeClass="h-7 w-7"
                                    textClass="text-sm"
                                />
                            );
                        }
                        if (npc && inSight) {
                            content = (
                                <span title={`${npc.name} (${npc.role})`}>
                                    <SpriteDisplay sprite={npc.sprite} alt={npc.name} frame2={npc.spriteFrame2} />
                                </span>
                            );
                        }
                        if (enemy && inSight) {
                            content = (
                                <span title={`${enemy.name} (${enemy.currentHp}/${enemy.hp} HP)`}>
                                    <SpriteDisplay sprite={enemy.sprite} alt={enemy.name} frame2={enemy.spriteFrame2} />
                                </span>
                            );
                        }

                        if (isPlayer) {
                            content = <SpriteDisplay sprite={player.sprite} alt={player.name} frame2={player.spriteFrame2} />;
                        }

                        return (
                            <div
                                key={`${x}-${y}`}
                                onClick={() => {
                                    if (targetable && enemy) onRangedAttack(enemy.id);
                                }}
                                className={`flex h-9 w-9 items-center justify-center rounded select-none ${bg} ${inSight ? "" : "opacity-35"
                                    } ${targetable ? "cursor-crosshair ring-2 ring-amber-400" : ""}`}
                            >
                                {content}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <div className="grid grid-cols-3 gap-1.5">
                    <div />
                    <button
                        type="button"
                        onClick={() => onMove(0, -1)}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm hover:bg-zinc-800"
                    >
                        ▲
                    </button>
                    <div />
                    <button
                        type="button"
                        onClick={() => onMove(-1, 0)}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm hover:bg-zinc-800"
                    >
                        ◀
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove(0, 1)}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm hover:bg-zinc-800"
                    >
                        ▼
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove(1, 0)}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm hover:bg-zinc-800"
                    >
                        ▶
                    </button>
                </div>

                {player.combatType === "ranged" && (
                    <button
                        type="button"
                        onClick={() => onRangedAttack()}
                        className="rounded-xl border border-amber-600 bg-amber-950/70 px-4 py-3 text-xs font-semibold text-amber-200 hover:bg-amber-900/70"
                    >
                        🏹 Ranged Strike [Space]
                        <span className="mt-0.5 block text-amber-400/80">Range: {player.range} tiles</span>
                    </button>

                )}
                {player.skill && (
                    <button
                        type="button"
                        disabled={player.skillCooldown > 0}
                        onClick={onUseSkill}
                        className="rounded-xl border border-purple-600 bg-purple-950/70 px-4 py-3 text-xs font-semibold text-purple-200 hover:bg-purple-900/70 disabled:opacity-45"
                    >
                        ⚡ {player.skill.name} [Q]
                        <span className="mt-0.5 block text-purple-300/80">
                            {player.skillCooldown > 0
                                ? `Cooldown: ${player.skillCooldown} turn(s)`
                                : "Ready!"}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
