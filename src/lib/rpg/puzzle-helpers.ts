import type { RpgFloor } from "./schema";

export type CoordMap = Record<string, { x: number; y: number }>;

export function getBlockPosition(
  block: { id: string; x: number; y: number },
  blockPositions: CoordMap
): { x: number; y: number } {
  return blockPositions[block.id] ?? { x: block.x, y: block.y };
}

export function isPuzzleGateOpen(
  floor: RpgFloor,
  gateId: string,
  blockPositions: CoordMap,
  pulledLevers: string[],
  playerPos?: { x: number; y: number }
): boolean {
  const plates = (floor.pressurePlates ?? []).filter((p) => p.gateId === gateId);
  const levers = (floor.levers ?? []).filter((l) => l.gateId === gateId);

  if (plates.length === 0 && levers.length === 0) return false;

  const blocks = (floor.pushBlocks ?? []).map((b) => getBlockPosition(b, blockPositions));

  const allPlatesPressed = plates.every((plate) => {
    const blockOnPlate = blocks.some((b) => b.x === plate.x && b.y === plate.y);
    const playerOnPlate = Boolean(playerPos && playerPos.x === plate.x && playerPos.y === plate.y);
    return blockOnPlate || playerOnPlate;
  });

  const allLeversPulled = levers.every((lv) => pulledLevers.includes(lv.id));

  return allPlatesPressed && allLeversPulled;
}
