import type { RpgFloorTrap } from "./schema";
import type { PlayerRuntimeState } from "./runtime-types";
import { applyElementalHit } from "./elemental-helpers";

export function applyFloorTrapEffect(
  player: PlayerRuntimeState,
  trap: RpgFloorTrap
): {
  updatedPlayer: PlayerRuntimeState;
  trapLog: string;
} {
  const hasBoots = Boolean(player.equippedGear?.boots);
  const dmg = hasBoots ? Math.max(1, Math.floor(trap.damage / 2)) : trap.damage;
  const nextHp = Math.max(0, player.hp - dmg);
  const bootsNote = hasBoots ? " (👢 Boots softened impact!)" : "";

  if (trap.trapType === "poison_vent") {
    const fx = hasBoots
      ? { nextStatuses: player.statuses ?? [], note: "" }
      : applyElementalHit(player.statuses ?? [], "venom");
    return {
      updatedPlayer: { ...player, hp: nextHp, statuses: fx.nextStatuses },
      trapLog: `🧪 Poison Vent erupted for ${dmg} dmg!${bootsNote}${fx.note}`,
    };
  }

  if (trap.trapType === "lava_crack") {
    const fx = hasBoots
      ? { nextStatuses: player.statuses ?? [], note: "" }
      : applyElementalHit(player.statuses ?? [], "fire");
    return {
      updatedPlayer: { ...player, hp: nextHp, statuses: fx.nextStatuses },
      trapLog: `🌋 Lava Crack scorched you for ${dmg} dmg!${bootsNote}${fx.note}`,
    };
  }

  return {
    updatedPlayer: { ...player, hp: nextHp },
    trapLog: `⚙️ Spike Trap pierced you for ${dmg} dmg!${bootsNote}`,
  };
}
