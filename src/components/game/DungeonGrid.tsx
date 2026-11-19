"use client";

import type { RpgBlueprint, RpgFloor } from "@/lib/rpg/schema";
import type { ActiveEnemy, PlayerRuntimeState } from "@/lib/rpg/runtime-types";
import { DUNGEON_THEMES, type ThemeId } from "@/lib/rpg/themes";
import { resolveTileSprite } from "@/lib/rpg/tile-resolver";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";

type Props = {
  floor: RpgFloor;
  themeId?: ThemeId;
  customSprites?: RpgBlueprint["customSprites"];
  fogOfWar: boolean;
  exploredTiles: string[];
  player: PlayerRuntimeState;
  enemies: ActiveEnemy[];
  openedChests: string[];
  usedShrines: string[];
  onAttackEnemy?: (enemyId: string) => void;
};

export function DungeonGrid({
  floor,
  themeId,
  customSprites,
  fogOfWar,
  exploredTiles,
  player,
  enemies,
  openedChests,
  usedShrines,
  onAttackEnemy,
}: Props) {
  const theme = DUNGEON_THEMES[themeId ?? "crypt"] ?? DUNGEON_THEMES.crypt;
  const cols = floor.grid?.length ?? 10;

  return (
    <div
      className="inline-grid gap-0.5 rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-inner"
      style={{ gridTemplateColumns: `repeat(${cols}, 2.25rem)` }}
    >
      {floor.grid.map((row, y) =>
        row.split("").map((tile, x) => {
          const tileKey = `${floor.id}:${x},${y}`;
          const isVisible = !fogOfWar || exploredTiles.includes(tileKey);

          if (!isVisible) {
            return (
              <div
                key={`${x}-${y}`}
                className="flex h-9 w-9 items-center justify-center rounded bg-zinc-950/90 text-zinc-800"
              >
                ▪
              </div>
            );
          }

          const isPlayer = player.x === x && player.y === y;
          const enemy = enemies.find((e) => e.x === x && e.y === y && e.currentHp > 0);
          const npc = (floor.npcs ?? []).find((n) => n.x === x && n.y === y);
          const chest = (floor.chests ?? []).find(
            (c) => c.x === x && c.y === y && !openedChests.includes(c.id)
          );
          const prop = (floor.props ?? []).find((p) => p.x === x && p.y === y);

          const dist = Math.abs(player.x - x) + Math.abs(player.y - y);
          const canRangedHit =
            Boolean(enemy) &&
            player.combatType === "ranged" &&
            dist >= 1 &&
            dist <= player.range;

          const baseBg =
            tile === "#"
              ? theme.wallBg
              : tile === "S"
                ? theme.stairsBg
                : tile === "H"
                  ? theme.shrineBg
                  : theme.floorBg;
          const baseSprite = resolveTileSprite(tile, x, y, floor, customSprites);

          return (
            <div
              key={`${x}-${y}`}
              onClick={() => canRangedHit && enemy && onAttackEnemy?.(enemy.id)}
              title={canRangedHit ? `Click to shoot ${enemy?.name}` : undefined}
              className={`relative flex h-9 w-9 items-center justify-center rounded transition ${baseBg} ${
                canRangedHit ? "cursor-crosshair ring-2 ring-amber-400" : ""
              }`}
            >
              {baseSprite && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-85">
                  <SpriteDisplay sprite={baseSprite} sizeClass="h-8 w-8" />
                </div>
              )}

              {prop && !isPlayer && !enemy && !npc && !chest && tile !== "#" && (
                <div className="pointer-events-none relative z-10 flex items-center justify-center">
                  <SpriteDisplay
                    sprite={prop.sprite}
                    frame2={prop.spriteFrame2}
                    alt="Prop"
                    sizeClass="h-7 w-7"
                  />
                </div>
              )}

              <div className="relative z-10 flex items-center justify-center">
                {isPlayer ? (
                  <SpriteDisplay
                    sprite={player.sprite}
                    frame2={player.spriteFrame2}
                    alt={player.name}
                  />
                ) : enemy ? (
                  <SpriteDisplay
                    sprite={enemy.sprite}
                    frame2={enemy.spriteFrame2}
                    alt={enemy.name}
                  />
                ) : npc ? (
                  <SpriteDisplay
                    sprite={npc.sprite}
                    frame2={npc.spriteFrame2}
                    alt={npc.name}
                  />
                ) : chest ? (
                  <SpriteDisplay sprite={customSprites?.chest ?? theme.chestIcon} alt="Chest" />
                ) : tile === "S" ? (
                  <SpriteDisplay sprite={customSprites?.stairs ?? theme.stairsIcon} alt="Stairs" />
                ) : tile === "H" && !usedShrines.includes(tileKey) ? (
                  <SpriteDisplay
                    sprite={customSprites?.shrine ?? theme.shrineIcon}
                    frame2={customSprites?.shrineFrame2}
                    alt="Shrine"
                  />
                ) : null}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
