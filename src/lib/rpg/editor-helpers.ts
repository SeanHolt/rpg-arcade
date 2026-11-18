import type { RpgBlueprint, RpgFloor } from "./schema";

export type BrushTool =
  | "wall"
  | "floor"
  | "stairs"
  | "shrine"
  | "player"
  | "enemy"
  | "boss"
  | "chest"
  | "npc"
  | "erase_entity";

export function createBlankGrid(size: number): string[] {
  const topBottom = "#".repeat(size);
  const middle = "#" + ".".repeat(size - 2) + "#";
  return Array.from({ length: size }, (_, idx) =>
    idx === 0 || idx === size - 1 ? topBottom : middle
  );
}

export function createDefaultBlueprint(): RpgBlueprint {
  return {
    title: "My Custom Dungeon",
    description: "Explore the halls, gather strength, and defeat the dungeon boss.",
    difficulty: "Normal",
    theme: "crypt",
    customSprites: {},
    fogOfWar: false,
    visionRadius: 2,
    classes: [],
    player: {
      name: "Hero",
      sprite: "🧙",
      startFloorId: "floor-1",
      startX: 1,
      startY: 1,
      maxHp: 100,
      atk: 18,
      def: 5,
    },
    floors: [
      {
        id: "floor-1",
        name: "Floor 1: Entrance Hall",
        grid: createBlankGrid(10),
        enemies: [
           {
            id: "boss-1",
            name: "Dungeon Overlord",
            sprite: "👑",
            x: 8,
            y: 8,
            hp: 90,
            atk: 20,
            def: 6,
            xpReward: 150,
            isBoss: true,
            element: "none",
            aiBehavior: "stationary",
          },
        ],
        chests: [],
        npcs: [],
        stairways: [],
      },
    ],
  };
}

export function resizeFloorGrid(floor: RpgFloor, width: number, height: number): RpgFloor {
  const w = Math.max(8, Math.min(24, Math.floor(width)));
  const h = Math.max(8, Math.min(24, Math.floor(height)));
  const oldW = floor.grid.at(0)?.length ?? 0;
  const oldH = floor.grid.length;

  const nextGrid: string[] = [];
  for (let y = 0; y < h; y++) {
    let row = "";
    for (let x = 0; x < w; x++) {
      const isEdge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      if (isEdge) {
        row += "#";
      } else {
        const existing = floor.grid.at(y)?.at(x);
        const wasOldEdge = y === oldH - 1 || x === oldW - 1;
        row += existing && !wasOldEdge ? existing : ".";
      }
    }
    nextGrid.push(row);
  }

  return {
    ...floor,
    grid: nextGrid,
    enemies: floor.enemies.filter((e) => e.x > 0 && e.x < w - 1 && e.y > 0 && e.y < h - 1),
    chests: (floor.chests ?? []).filter((c) => c.x > 0 && c.x < w - 1 && c.y > 0 && c.y < h - 1),
    npcs: (floor.npcs ?? []).filter((n) => n.x > 0 && n.x < w - 1 && n.y > 0 && n.y < h - 1),
    stairways: floor.stairways.filter(
      (st) => st.from.x > 0 && st.from.x < w - 1 && st.from.y > 0 && st.from.y < h - 1
    ),
  };
}
