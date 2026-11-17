import type { ElementType } from "./schema";
import type { ActiveStatusEffect, PlayerRuntimeState } from "./runtime-types";

export function elementBadge(el?: ElementType): string {
  if (el === "fire") return "🔥";
  if (el === "ice") return "❄️";
  if (el === "venom") return "🧪";
  return "";
}

export function getEffectivePlayerElement(player: PlayerRuntimeState): ElementType {
  const weaponEl = player.equippedGear?.weapon?.element;
  if (weaponEl && weaponEl !== "none") return weaponEl;
  return player.element ?? "none";
}

export function applyElementalHit(
  currentStatuses: ActiveStatusEffect[],
  element?: ElementType
): { nextStatuses: ActiveStatusEffect[]; note: string } {
  if (!element || element === "none") {
    return { nextStatuses: currentStatuses, note: "" };
  }

  const next = currentStatuses.filter((s) =>
    element === "fire" ? s.type !== "burn" : element === "ice" ? s.type !== "freeze" : s.type !== "poison"
  );

  if (element === "fire") {
    next.push({ type: "burn", turnsLeft: 3 });
    return { nextStatuses: next, note: " 🔥 Inflicted Burn (3t)!" };
  }
  if (element === "ice") {
    next.push({ type: "freeze", turnsLeft: 1 });
    return { nextStatuses: next, note: " ❄️ Target Frozen (skips next attack)!" };
  }
  next.push({ type: "poison", turnsLeft: 4 });
  return { nextStatuses: next, note: " 🧪 Inflicted Poison (4t)!" };
}

export function consumeFreeze(statuses: ActiveStatusEffect[]): {
  wasFrozen: boolean;
  nextStatuses: ActiveStatusEffect[];
} {
  const idx = statuses.findIndex((s) => s.type === "freeze" && s.turnsLeft > 0);
  if (idx === -1) return { wasFrozen: false, nextStatuses: statuses };

  const nextStatuses = statuses
    .map((s, i) => (i === idx ? { ...s, turnsLeft: s.turnsLeft - 1 } : s))
    .filter((s) => s.turnsLeft > 0);

  return { wasFrozen: true, nextStatuses };
}

export function tickDamageOverTime(statuses: ActiveStatusEffect[]): {
  dotDamage: number;
  nextStatuses: ActiveStatusEffect[];
  labels: string[];
} {
  let dotDamage = 0;
  const labels: string[] = [];

  const nextStatuses = statuses
    .map((s) => {
      if (s.type === "burn") {
        dotDamage += 4;
        labels.push("🔥 Burn (-4 HP)");
      } else if (s.type === "poison") {
        dotDamage += 3;
        labels.push("🧪 Poison (-3 HP)");
      }
      return { ...s, turnsLeft: s.turnsLeft - 1 };
    })
    .filter((s) => s.turnsLeft > 0);

  return { dotDamage, nextStatuses, labels };
}
