import type { RpgFloor } from "./schema";

export type RoomPrefabId = "arena" | "vault" | "sanctuary";

export function rotateFloor90(floor: RpgFloor): RpgFloor {
  const n = floor.grid.length;
  const newGrid = Array.from({ length: n }, (_, ny) =>
    Array.from({ length: n }, (_, nx) => floor.grid[n - 1 - nx]?.[ny] ?? "#").join("")
  );

  const rot = (x: number, y: number) => ({ x: n - 1 - y, y: x });

  const nextVariants: Record<string, number> = {};
  Object.entries(floor.tileVariants ?? {}).forEach(([key, val]) => {
    const [ox, oy] = key.split(",").map(Number);
    const p = rot(ox, oy);
    nextVariants[`${p.x},${p.y}`] = val;
  });

  return {
    ...floor,
    grid: newGrid,
    tileVariants: nextVariants,
    enemies: floor.enemies.map((e) => ({ ...e, ...rot(e.x, e.y) })),
    chests: (floor.chests ?? []).map((c) => ({ ...c, ...rot(c.x, c.y) })),
    npcs: (floor.npcs ?? []).map((npc) => ({ ...npc, ...rot(npc.x, npc.y) })),
    props: (floor.props ?? []).map((pr) => ({ ...pr, ...rot(pr.x, pr.y) })),
    stairways: (floor.stairways ?? []).map((s) => ({
      ...s,
      from: rot(s.from.x, s.from.y),
    })),
    portals: (floor.portals ?? []).map((pt) => {
      const src = rot(pt.x, pt.y);
      const dst = rot(pt.targetX, pt.targetY);
      return { ...pt, x: src.x, y: src.y, targetX: dst.x, targetY: dst.y };
    }),
  };
}

export function flipFloorHorizontal(floor: RpgFloor): RpgFloor {
  const n = floor.grid.length;
  const newGrid = floor.grid.map((row) => row.split("").reverse().join(""));
  const flipX = (x: number) => n - 1 - x;

  const nextVariants: Record<string, number> = {};
  Object.entries(floor.tileVariants ?? {}).forEach(([key, val]) => {
    const [ox, oy] = key.split(",").map(Number);
    nextVariants[`${flipX(ox)},${oy}`] = val;
  });

  return {
    ...floor,
    grid: newGrid,
    tileVariants: nextVariants,
    enemies: floor.enemies.map((e) => ({ ...e, x: flipX(e.x) })),
    chests: (floor.chests ?? []).map((c) => ({ ...c, x: flipX(c.x) })),
    npcs: (floor.npcs ?? []).map((npc) => ({ ...npc, x: flipX(npc.x) })),
    props: (floor.props ?? []).map((pr) => ({ ...pr, x: flipX(pr.x) })),
    stairways: (floor.stairways ?? []).map((s) => ({
      ...s,
      from: { x: flipX(s.from.x), y: s.from.y },
    })),
    portals: (floor.portals ?? []).map((pt) => ({
      ...pt,
      x: flipX(pt.x),
      targetX: flipX(pt.targetX),
    })),
  };
}

const ROOM_PATTERNS: Record<RoomPrefabId, string[]> = {
  arena: ["#...#", ".....", "..H..", ".....", "#...#"],
  vault: ["##.##", "#...#", ".....", "#...#", "##.##"],
  sanctuary: ["#...#", ".H.H.", ".....", ".H.H.", "#...#"],
};

export function stampRoomPrefab(floor: RpgFloor, prefab: RoomPrefabId): RpgFloor {
  const n = floor.grid.length;
  const start = Math.max(1, Math.floor((n - 5) / 2));
  const pattern = ROOM_PATTERNS[prefab];

  const rows = floor.grid.map((r) => r.split(""));
  for (let dy = 0; dy < 5; dy++) {
    for (let dx = 0; dx < 5; dx++) {
      const gx = start + dx;
      const gy = start + dy;
      if (gx > 0 && gx < n - 1 && gy > 0 && gy < n - 1) {
        rows[gy][gx] = pattern[dy][dx];
      }
    }
  }

  return {
    ...floor,
    grid: rows.map((r) => r.join("")),
  };
}
