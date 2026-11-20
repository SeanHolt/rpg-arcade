import type { RpgFloor, RpgSign } from "./schema";

export type PuzzleTool = "sign" | "push_block" | "plate" | "lever" | "gate";

export function togglePuzzleOnFloor(
  floor: RpgFloor,
  tool: PuzzleTool,
  x: number,
  y: number
): RpgFloor {
  const tile = floor.grid.at(y)?.at(x);
  if (!tile || tile === "#") return floor;

  const uid = `${Date.now().toString(36)}-${x}-${y}`;
  const defaultGateId = floor.puzzleGates?.at(0)?.id ?? "gate-1";

  if (tool === "sign") {
    const list = floor.signs ?? [];
    const exists = list.some((s) => s.x === x && s.y === y);
    return {
      ...floor,
      signs: exists
        ? list.filter((s) => !(s.x === x && s.y === y))
        : [
            ...list,
            {
              id: `sign-${uid}`,
              x,
              y,
              title: "Ancient Tablet",
              message: "Beware the shadow ahead.",
            },
          ],
    };
  }

  if (tool === "push_block") {
    const list = floor.pushBlocks ?? [];
    const exists = list.some((b) => b.x === x && b.y === y);
    return {
      ...floor,
      pushBlocks: exists
        ? list.filter((b) => !(b.x === x && b.y === y))
        : [...list, { id: `block-${uid}`, x, y }],
    };
  }

  if (tool === "gate") {
    const list = floor.puzzleGates ?? [];
    const exists = list.some((g) => g.x === x && g.y === y);
    return {
      ...floor,
      puzzleGates: exists
        ? list.filter((g) => !(g.x === x && g.y === y))
        : [
            ...list,
            {
              id: list.length === 0 ? "gate-1" : `gate-${uid}`,
              x,
              y,
              label: "Iron Gate",
            },
          ],
    };
  }

  if (tool === "plate") {
    const list = floor.pressurePlates ?? [];
    const exists = list.some((p) => p.x === x && p.y === y);
    return {
      ...floor,
      pressurePlates: exists
        ? list.filter((p) => !(p.x === x && p.y === y))
        : [...list, { id: `plate-${uid}`, x, y, gateId: defaultGateId }],
    };
  }

  const list = floor.levers ?? [];
  const exists = list.some((l) => l.x === x && l.y === y);
  return {
    ...floor,
    levers: exists
      ? list.filter((l) => !(l.x === x && l.y === y))
      : [...list, { id: `lever-${uid}`, x, y, gateId: defaultGateId }],
  };
}

export function updateSignOnFloor(
  floor: RpgFloor,
  signId: string,
  fields: Partial<RpgSign>
): RpgFloor {
  return {
    ...floor,
    signs: (floor.signs ?? []).map((s) => (s.id === signId ? { ...s, ...fields } : s)),
  };
}
