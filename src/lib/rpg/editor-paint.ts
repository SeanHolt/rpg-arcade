import type { RpgBlueprint } from "./schema";
import type { BrushTool } from "./editor-helpers";

export type PaintResult = {
  blueprint: RpgBlueprint;
  selectedEnemyId: string | null;
  selectedChestId: string | null;
  selectedNpcId: string | null;
};

export function applyCellPaint(
  blueprint: RpgBlueprint,
  activeFloorId: string,
  activeTool: BrushTool,
  x: number,
  y: number,
  currentSelection: {
    selectedEnemyId: string | null;
    selectedChestId: string | null;
    selectedNpcId: string | null;
  }
): PaintResult | null {
  const floor = blueprint.floors.find((f) => f.id === activeFloorId);
  if (!floor) return null;

  const setChar = (ch: string) =>
    floor.grid.map((r, ry) => (ry !== y ? r : r.slice(0, x) + ch + r.slice(x + 1)));

  let grid = floor.grid;
  let enemies = floor.enemies.filter((e) => !(e.x === x && e.y === y));
  let chests = (floor.chests ?? []).filter((c) => !(c.x === x && c.y === y));
  let npcs = (floor.npcs ?? []).filter((n) => !(n.x === x && n.y === y));
  let stairways = [...floor.stairways];
  let player = blueprint.player;
  let { selectedEnemyId, selectedChestId, selectedNpcId } = currentSelection;

  if (activeTool === "wall") {
    grid = setChar("#");
    stairways = stairways.filter((st) => !(st.from.x === x && st.from.y === y));
  } else if (activeTool === "floor") {
    grid = setChar(".");
    stairways = stairways.filter((st) => !(st.from.x === x && st.from.y === y));
  } else if (activeTool === "shrine") {
    grid = setChar("H");
  } else if (activeTool === "stairs") {
    grid = setChar("S");
    if (!stairways.some((st) => st.from.x === x && st.from.y === y)) {
      const target = blueprint.floors.find((f) => f.id !== activeFloorId) ?? floor;
      stairways.push({ from: { x, y }, toFloorId: target.id, to: { x: 1, y: 1 } });
    }
  } else if (activeTool === "player") {
    if (floor.grid.at(y)?.at(x) === "#") grid = setChar(".");
    player = { ...player, startFloorId: activeFloorId, startX: x, startY: y };
  } else if (activeTool === "enemy" || activeTool === "boss") {
    if (floor.grid.at(y)?.at(x) === "#") grid = setChar(".");
    const isBoss = activeTool === "boss";
    const id = `mob-${Date.now().toString(36)}`;
    enemies = [
      ...enemies,
      {
        id,
        name: isBoss ? "Dungeon Boss" : "Skeleton Warrior",
        sprite: isBoss ? "🐉" : "💀",
        x,
        y,
        hp: isBoss ? 110 : 35,
        atk: isBoss ? 22 : 12,
        def: isBoss ? 7 : 3,
        xpReward: isBoss ? 200 : 25,
        isBoss,
        element: "none",
        aiBehavior: "stationary",
      },
    ];
    selectedEnemyId = id;
    selectedChestId = null;
    selectedNpcId = null;
  } else if (activeTool === "chest") {
    if (floor.grid.at(y)?.at(x) === "#") grid = setChar(".");
    const id = `chest-${Date.now().toString(36)}`;
    chests = [
      ...chests,
      {
        id,
        x,
        y,
        itemType: "potion",
        itemName: "Healing Potion",
        value: 40,
        element: "none",
      },
    ];
    selectedChestId = id;
    selectedEnemyId = null;
    selectedNpcId = null;
  } else if (activeTool === "npc") {
    if (floor.grid.at(y)?.at(x) === "#") grid = setChar(".");
    const id = `npc-${Date.now().toString(36)}`;
    npcs = [
      ...npcs,
      {
        id,
        name: "Wandering Merchant",
        sprite: "🧙‍♂️",
        x,
        y,
        role: "merchant",
        dialogue: "Welcome traveler! Spend your gold wisely.",
        shopItems: [
            {
              id: `item-${Date.now()}`,
              itemType: "potion",
              itemName: "Elixir",
              value: 50,
              goldCost: 20,
              element: "none",
            },
          ],
      },
    ];
    selectedNpcId = id;
    selectedEnemyId = null;
    selectedChestId = null;
  }

  const floors = blueprint.floors.map((f) =>
    f.id === activeFloorId ? { ...f, grid, enemies, chests, npcs, stairways } : f
  );

  return {
    blueprint: { ...blueprint, player, floors },
    selectedEnemyId,
    selectedChestId,
    selectedNpcId,
  };
}
