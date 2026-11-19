import type { RpgBlueprint, RpgFloor } from "./schema";

export function resolveTileSprite(
  tile: string,
  x: number,
  y: number,
  floor: Pick<RpgFloor, "tileVariants">,
  customSprites?: RpgBlueprint["customSprites"]
): string | undefined {
  const variantIdx = floor.tileVariants?.[`${x},${y}`] ?? 0;

  if (tile === "#") {
    if (variantIdx > 0 && customSprites?.wallVariants?.[variantIdx - 1]) {
      return customSprites.wallVariants[variantIdx - 1];
    }
    return customSprites?.wall;
  }

  if (variantIdx > 0 && customSprites?.floorVariants?.[variantIdx - 1]) {
    return customSprites.floorVariants[variantIdx - 1];
  }
  return customSprites?.floor;
}
