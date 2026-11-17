import type { GameStatus, PlayerRuntimeState } from "@/lib/rpg/runtime-types";
import { playRetroSfx } from "./retro-synth";

export type SfxSnapshot = {
  status: GameStatus;
  player: PlayerRuntimeState | null;
  openedChestsCount: number;
  usedShrinesCount: number;
  logsTop?: string;
};

export function playSfxFromTransition(
  action: "move" | "ranged" | "skill" | "potion" | "shop" | "quest",
  prev: SfxSnapshot,
  next: SfxSnapshot
): void {
  if (!prev.player || !next.player) return;

  if (prev.status === "playing" && next.status === "victory") {
    playRetroSfx("victory");
    return;
  }
  if (prev.status === "playing" && next.status === "defeat") {
    playRetroSfx("defeat");
    return;
  }

  if (next.player.level > prev.player.level) {
    playRetroSfx("levelup");
    return;
  }

  if (action === "potion" && next.player.hp > prev.player.hp) {
    playRetroSfx("potion");
    return;
  }
  if (action === "skill" && next.player.skillCooldown > prev.player.skillCooldown) {
    playRetroSfx("skill");
    return;
  }
  if (action === "ranged" && next.logsTop !== prev.logsTop) {
    playRetroSfx("ranged");
    return;
  }
  if (action === "shop" || action === "quest") {
    playRetroSfx("chest");
    return;
  }

  if (next.openedChestsCount > prev.openedChestsCount) {
    playRetroSfx("chest");
    return;
  }
  if (next.usedShrinesCount > prev.usedShrinesCount) {
    playRetroSfx("shrine");
    return;
  }

  const moved = next.player.x !== prev.player.x || next.player.y !== prev.player.y;
  const logChanged = next.logsTop !== prev.logsTop;

  if (!moved && logChanged) {
    playRetroSfx("hit");
  } else if (moved && logChanged && next.logsTop?.includes("Defeated")) {
    playRetroSfx("hit");
  } else if (moved) {
    playRetroSfx("step");
  }
}
