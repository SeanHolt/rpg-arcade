"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { DUNGEON_THEMES } from "@/lib/rpg/themes";
import { resolveTileSprite } from "@/lib/rpg/tile-resolver";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";

export function StudioGrid() {
  const {
    blueprint,
    activeFloorId,
    activeTool,
    paintCell,
    paintTileVariant,
    toggleFloorProp,
  } = useEditorStore();
  const [isPainting, setIsPainting] = useState(false);

  const floor =
    blueprint.floors.find((f) => f.id === activeFloorId) ?? blueprint.floors[0];
  if (!floor) return null;

  const theme = DUNGEON_THEMES[blueprint.theme ?? "crypt"] ?? DUNGEON_THEMES.crypt;
  const cols = floor.grid[0]?.length ?? 10;

  const handleCellAction = (x: number, y: number, isClickStart: boolean) => {
    if (activeTool === "prop") {
      if (isClickStart) toggleFloorProp(x, y);
      return;
    }
    paintCell(x, y);
    if (activeTool === "wall" || activeTool === "floor") {
      paintTileVariant(x, y);
    }
  };

  return (
    <div
      onMouseUp={() => setIsPainting(false)}
      onMouseLeave={() => setIsPainting(false)}
      className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4"
    >
      <div
        className="mx-auto inline-grid gap-0.5 select-none"
        style={{ gridTemplateColumns: `repeat(${cols}, 2.25rem)` }}
      >
        {floor.grid.map((row, y) =>
          row.split("").map((tile, x) => {
            const isSpawn =
              blueprint.player.startFloorId === floor.id &&
              blueprint.player.startX === x &&
              blueprint.player.startY === y;
            const enemy = floor.enemies.find((e) => e.x === x && e.y === y);
            const chest = (floor.chests ?? []).find((c) => c.x === x && c.y === y);
            const npc = (floor.npcs ?? []).find((n) => n.x === x && n.y === y);
            const prop = (floor.props ?? []).find((p) => p.x === x && p.y === y);
            const portal = (floor.portals ?? []).find((pt) => pt.x === x && pt.y === y);

            const baseBg =
              tile === "#"
                ? theme.wallBg
                : tile === "S"
                  ? theme.stairsBg
                  : tile === "H"
                    ? theme.shrineBg
                    : theme.floorBg;
            const baseSprite = resolveTileSprite(
              tile,
              x,
              y,
              floor,
              blueprint.customSprites
            );

            return (
              <div
                key={`${x}-${y}`}
                onMouseDown={() => {
                  setIsPainting(true);
                  handleCellAction(x, y, true);
                }}
                onMouseEnter={() => {
                  if (isPainting) handleCellAction(x, y, false);
                }}
                className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded border border-zinc-800/50 transition hover:brightness-125 ${baseBg}`}
              >
                {baseSprite && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-85">
                    <SpriteDisplay sprite={baseSprite} sizeClass="h-8 w-8" />
                  </div>
                )}

                {prop && !isSpawn && !enemy && !chest && !npc && tile !== "#" && (
                  <div className="pointer-events-none relative z-10 flex items-center justify-center">
                    <SpriteDisplay sprite={prop.sprite} sizeClass="h-6 w-6" />
                  </div>
                )}

                <div className="relative z-10 flex items-center justify-center">
                  {isSpawn ? (
                    <SpriteDisplay sprite={blueprint.player.sprite} sizeClass="h-6 w-6" />
                  ) : enemy ? (
                    <SpriteDisplay sprite={enemy.sprite} sizeClass="h-6 w-6" />
                  ) : chest ? (
                    <SpriteDisplay
                      sprite={blueprint.customSprites?.chest ?? theme.chestIcon}
                      sizeClass="h-6 w-6"
                    />
                  ) : npc ? (
                    <SpriteDisplay sprite={npc.sprite} sizeClass="h-6 w-6" />
                  ) : portal ? (
                    <span
                      title={`Portal → (${portal.targetX}, ${portal.targetY})`}
                      className="text-sm"
                    >
                      🌀
                    </span>
                  ) : tile === "S" ? (
                    <SpriteDisplay
                      sprite={blueprint.customSprites?.stairs ?? theme.stairsIcon}
                      sizeClass="h-6 w-6"
                    />
                  ) : tile === "H" ? (
                    <SpriteDisplay
                      sprite={blueprint.customSprites?.shrine ?? theme.shrineIcon}
                      sizeClass="h-6 w-6"
                    />
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
