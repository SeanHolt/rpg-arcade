import type { RpgBlueprint } from "./schema";
import type { ActiveEnemy, PlayerRuntimeState } from "./runtime-types";
import { consumeFreeze, tickDamageOverTime } from "./elemental-helpers";

export function runEnemyTurnPhase(
  floor: RpgBlueprint["floors"][number],
  enemies: ActiveEnemy[],
  player: PlayerRuntimeState,
  smartAiEnabled: boolean
): {
  updatedEnemies: ActiveEnemy[];
  updatedPlayer: PlayerRuntimeState;
  aiLogs: string[];
  playerDefeated: boolean;
} {
  let nextPlayer = { ...player };
  const aiLogs: string[] = [];
  const nextEnemies = enemies.map((e) => ({ ...e }));

  for (let i = 0; i < nextEnemies.length; i++) {
    const enemy = nextEnemies[i];
    if (enemy.currentHp <= 0) continue;

    // 1. Tick Burn / Poison DoT on enemy
    const dot = tickDamageOverTime(enemy.statuses ?? []);
    if (dot.dotDamage > 0) {
      const postDotHp = Math.max(0, enemy.currentHp - dot.dotDamage);
      nextEnemies[i] = { ...enemy, currentHp: postDotHp, statuses: dot.nextStatuses };
      aiLogs.push(`${enemy.name} took ${dot.dotDamage} status damage (${dot.labels.join(", ")}).`);
      if (postDotHp === 0) {
        aiLogs.push(`💀 ${enemy.name} succumbed to status damage!`);
        continue;
      }
    } else {
      nextEnemies[i] = { ...enemy, statuses: dot.nextStatuses };
    }

    if (!smartAiEnabled) continue;

    // 2. Skip AI turn if Frozen
    const freeze = consumeFreeze(nextEnemies[i].statuses ?? []);
    if (freeze.wasFrozen) {
      nextEnemies[i] = { ...nextEnemies[i], statuses: freeze.nextStatuses };
      continue;
    }

    const cur = nextEnemies[i];
    const dist = Math.abs(cur.x - nextPlayer.x) + Math.abs(cur.y - nextPlayer.y);

    // 3. Telegraphed Special Attack Execution or Charge Warning
    if (cur.specialAttack) {
      if (cur.isChargingSpecial) {
        if (dist <= 2) {
          const raw = Math.round(cur.atk * cur.specialAttack.multiplier);
          const dmg = Math.max(2, raw - nextPlayer.def);
          nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - dmg) };
          aiLogs.push(`💥 ${cur.name} unleashed ${cur.specialAttack.name} for ${dmg} DMG!`);
        } else {
          aiLogs.push(`💨 You evaded ${cur.name}'s ${cur.specialAttack.name}!`);
        }
        nextEnemies[i] = {
          ...cur,
          isChargingSpecial: false,
          specialCooldown: cur.specialAttack.cooldown,
        };
        if (nextPlayer.hp === 0) break;
        continue;
      }

      const nextCd = Math.max(0, cur.specialCooldown - 1);
      if (nextCd === 0 && dist <= 2) {
        nextEnemies[i] = { ...cur, isChargingSpecial: true, specialCooldown: 0 };
        aiLogs.push(`⚠️ ${cur.name} is charging ${cur.specialAttack.name}! (Hits within 2 tiles next turn)`);
        continue;
      }
      nextEnemies[i] = { ...cur, specialCooldown: nextCd };
    }

    // 4. Patrol / Hunter Movement (only if not adjacent to player)
    const updatedCur = nextEnemies[i];
    if (dist <= 1 || updatedCur.aiBehavior === "stationary") continue;

    const aggroRange = updatedCur.aiBehavior === "hunter" ? 5 : 3;
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    const validSteps = dirs
      .map(([dx, dy]) => ({ x: updatedCur.x + dx, y: updatedCur.y + dy }))
      .filter((pos) => {
        if (pos.x === nextPlayer.x && pos.y === nextPlayer.y) return false;
        const tile = floor.grid.at(pos.y)?.at(pos.x);
        if (!tile || tile === "#") return false;
        const blockedByMob = nextEnemies.some(
          (other, idx) => idx !== i && other.currentHp > 0 && other.x === pos.x && other.y === pos.y
        );
        return !blockedByMob;
      });

    if (validSteps.length === 0) continue;

    let chosenStep = validSteps[Math.floor(Math.random() * validSteps.length)];
    if (dist <= aggroRange) {
      validSteps.sort(
        (a, b) =>
          Math.abs(a.x - nextPlayer.x) +
          Math.abs(a.y - nextPlayer.y) -
          (Math.abs(b.x - nextPlayer.x) + Math.abs(b.y - nextPlayer.y))
      );
      chosenStep = validSteps[0];
    }

    nextEnemies[i] = { ...updatedCur, x: chosenStep.x, y: chosenStep.y };
  }

  return {
    updatedEnemies: nextEnemies,
    updatedPlayer: nextPlayer,
    aiLogs,
    playerDefeated: nextPlayer.hp === 0,
  };
}
