"use client";

import { useEditorStore, type BrushTool } from "@/store/useEditorStore";
import { DUNGEON_THEMES } from "@/lib/rpg/themes";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";

const TOOLS: { id: BrushTool; label: string }[] = [
  { id: "wall", label: "🧱 Wall" },
  { id: "floor", label: "⬜ Floor" },
  { id: "shrine", label: "✨ Shrine" },
  { id: "stairs", label: "🪜 Stairs" },
  { id: "chest", label: "📦 Chest" },
  { id: "npc", label: "💬 NPC" },
  { id: "player", label: "🧙 Spawn" },
  { id: "enemy", label: "💀 Monster" },
  { id: "boss", label: "👑 Boss" },
  { id: "erase_entity", label: "🧹 Clear" },
];

export function StudioGrid() {
  const {
    blueprint,
    activeFloorId,
    activeTool,
    setActiveTool,
    selectEnemy,
    selectChest,
    selectNpc,
    paintCell,
  } = useEditorStore();

  const floor =
    blueprint.floors.find((f) => f.id === activeFloorId) ?? blueprint.floors.at(0)!;
  const width = floor.grid.at(0)?.length ?? 10;
  const theme = DUNGEON_THEMES[blueprint.theme ?? "crypt"] ?? DUNGEON_THEMES.crypt;
  const custom = blueprint.customSprites ?? {};

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => setActiveTool(tool.id)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              activeTool === tool.id
                ? "border-emerald-500 bg-emerald-950/70 text-emerald-200"
                : "border-zinc-800 bg-zinc-900 text-zinc-400"
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <div
          className="grid gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-2"
          style={{
            gridTemplateColumns: `repeat(${width}, minmax(2.25rem, 2.5rem))`,
          }}
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

              let bg = theme.floorBg;
              let sprite: string | undefined = custom.floor;

              if (tile === "#") {
                bg = theme.wallBg;
                sprite = custom.wall;
              } else if (tile === "S") {
                bg = theme.stairsBg;
                sprite = custom.stairs ?? theme.stairsIcon;
              } else if (tile === "H") {
                bg = theme.shrineBg;
                sprite = custom.shrine ?? theme.shrineIcon;
              }

              if (chest) sprite = custom.chest ?? theme.chestIcon;
              if (npc) sprite = npc.sprite;
              if (enemy) sprite = enemy.sprite;
              if (isSpawn) sprite = blueprint.player.sprite;

              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  onClick={() => {
                    if (enemy) selectEnemy(enemy.id);
                    else if (chest) selectChest(chest.id);
                    else if (npc) selectNpc(npc.id);
                    paintCell(x, y);
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded ${bg}`}
                >
                  {sprite && <SpriteDisplay sprite={sprite} sizeClass="h-7 w-7" />}
                </button>
              );
            })
          )}
        </div>
        <p className="mt-3 text-xs text-zinc-500">Click any tile to paint.</p>
      </div>
    </div>
  );
}