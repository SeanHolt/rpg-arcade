import type { RpgBlueprint } from "./schema";
import type {
  ActiveEnemy,
  ActiveQuestProgress,
  GameStatus,
  GearItem,
  PlayerRuntimeState,
  PotionItem,
} from "./runtime-types";
import { applyXpAndLevel, getRevealedKeys, recalculateStats } from "./combat-helpers";
import { incrementQuestProgress } from "./quest-helpers";
import {
  applyElementalHit,
  consumeFreeze,
  getEffectivePlayerElement,
  tickDamageOverTime,
} from "./elemental-helpers";
import { resolveMeleeBump } from "./melee-combat";
import { getGearSellPrice } from "./gear-perks";
import { FeatureFlagsMap } from "../feature-flag-defs";
import { runEnemyTurnPhase } from "./enemy-ai";

export type TurnState = {
  blueprint: RpgBlueprint;
  isEndless: boolean;
  status: GameStatus;
  currentFloorId: string;
  player: PlayerRuntimeState;
  enemiesByFloor: Record<string, ActiveEnemy[]>;
  usedShrines: string[];
  openedChests: string[];
  exploredTiles: string[];
  potions: PotionItem[];
  gearBag: GearItem[];
  activeNpcId: string | null;
  activeQuests: ActiveQuestProgress[];
  logs: string[];
  flags?: FeatureFlagsMap;
  turnsTaken: number;
};

function isFloorCleared(
  isEndless: boolean,
  floor: RpgBlueprint["floors"][number],
  enemies: ActiveEnemy[],
  openedChests: string[]
): boolean {
  if (!isEndless) return enemies.some((e) => e.isBoss && e.currentHp <= 0);
  const allDead = enemies.every((e) => e.currentHp <= 0);
  const allChests = (floor.chests ?? []).every((c) => openedChests.includes(c.id));
  return allDead && allChests;
}

function tickPlayerTurn(player: PlayerRuntimeState): PlayerRuntimeState {
  const nextCd = Math.max(0, player.skillCooldown - 1);
  const { dotDamage, nextStatuses } = tickDamageOverTime(player.statuses ?? []);
  const nextHp = dotDamage > 0 ? Math.max(1, player.hp - dotDamage) : player.hp;
  return { ...player, hp: nextHp, skillCooldown: nextCd, statuses: nextStatuses };
}

function computeRangedAttack(state: TurnState, enemyId?: string): Partial<TurnState> {
  const { blueprint, currentFloorId, player, enemiesByFloor, logs } = state;
  if (player.combatType !== "ranged") return {};

  const floor = blueprint.floors.find((f) => f.id === currentFloorId);
  const floorEnemies = enemiesByFloor[currentFloorId] ?? [];
  const inRange = floorEnemies.filter((e) => {
    if (e.currentHp <= 0) return false;
    const dist = Math.abs(e.x - player.x) + Math.abs(e.y - player.y);
    return dist > 0 && dist <= player.range;
  });

  if (inRange.length === 0) {
    return { logs: [`🏹 No enemies within ${player.range} tiles!`, ...logs].slice(0, 30) };
  }

  const target =
    (enemyId ? inRange.find((e) => e.id === enemyId) : undefined) ??
    inRange.sort(
      (a, b) =>
        Math.abs(a.x - player.x) +
        Math.abs(a.y - player.y) -
        (Math.abs(b.x - player.x) + Math.abs(b.y - player.y))
    ).at(0)!;

  const dmg = Math.max(1, player.atk - target.def);
  const nextHp = Math.max(0, target.currentHp - dmg);

  if (nextHp === 0) {
    const updatedEnemies = floorEnemies.map((e) =>
      e.id === target.id ? { ...e, currentHp: 0, statuses: [] } : e
    );
    const { updatedPlayer, levelMsg } = applyXpAndLevel(player, target.xpReward);
    const { updatedQuests, readyMessages } = incrementQuestProgress(
      state.activeQuests,
      "kill_enemies"
    );
    const cleared = Boolean(
      floor && isFloorCleared(state.isEndless, floor, updatedEnemies, state.openedChests)
    );

    return {
      status: cleared ? "victory" : "playing",
      enemiesByFloor: { ...enemiesByFloor, [currentFloorId]: updatedEnemies },
      player: tickPlayerTurn(updatedPlayer),
      activeQuests: updatedQuests,
      turnsTaken: state.turnsTaken + 1,
      logs: [
        cleared
          ? `🏆 Sniped ${target.name} and cleared the entire floor!`
          : `🏹 Ranged strike defeated ${target.name} (+${target.xpReward} XP)!${levelMsg}`,
        ...readyMessages,
        ...logs,
      ].slice(0, 30),
    };
  }

  const activeElement =
    state.flags?.elemental_effects === false ? "none" : getEffectivePlayerElement(player);
  const hitFx = applyElementalHit(target.statuses ?? [], activeElement);
  const freezeCheck = consumeFreeze(hitFx.nextStatuses);
  const updatedEnemies = floorEnemies.map((e) =>
    e.id === target.id ? { ...e, currentHp: nextHp, statuses: freezeCheck.nextStatuses } : e
  );

  const dist = Math.abs(target.x - player.x) + Math.abs(target.y - player.y);
  if (dist === 1 && !freezeCheck.wasFrozen) {
    const counter = Math.max(1, target.atk - player.def);
    const nextPlayerHp = Math.max(0, player.hp - counter);
    const enemyEl = state.flags?.elemental_effects === false ? "none" : target.element;
    const enemyFx = applyElementalHit(player.statuses ?? [], enemyEl);

    return {
      status: nextPlayerHp === 0 ? "defeat" : "playing",
      enemiesByFloor: { ...enemiesByFloor, [currentFloorId]: updatedEnemies },
      player: tickPlayerTurn({ ...player, hp: nextPlayerHp, statuses: enemyFx.nextStatuses }),
      turnsTaken: state.turnsTaken + 1,
      logs: [
        `🏹 Shot ${target.name} (${dmg} dmg).${hitFx.note} Countered for ${counter} dmg!${enemyFx.note}`,
        ...logs,
      ].slice(0, 30),
    };
  }

  return {
    enemiesByFloor: { ...enemiesByFloor, [currentFloorId]: updatedEnemies },
    player: tickPlayerTurn(player),
    turnsTaken: state.turnsTaken + 1,
    logs: [
      `🏹 Shot ${target.name} for ${dmg} dmg (${nextHp}/${target.hp} HP)!${hitFx.note}`,
      ...logs,
    ].slice(0, 30),
  };
}

function computeMove(state: TurnState, dx: number, dy: number): Partial<TurnState> {
  const {
    blueprint,
    currentFloorId,
    player,
    enemiesByFloor,
    usedShrines,
    openedChests,
    exploredTiles,
    potions,
    gearBag,
    logs,
  } = state;

  const floor = blueprint.floors.find((f) => f.id === currentFloorId);
  if (!floor) return {};

  const tx = player.x + dx;
  const ty = player.y + dy;
  const tile = floor.grid.at(ty)?.at(tx);
  if (!tile || tile === "#") return {};

  const pushLog = (msg: string) => [msg, ...logs].slice(0, 30);
  const reveal = (fId: string, px: number, py: number) =>
    Array.from(
      new Set([...exploredTiles, ...getRevealedKeys(fId, px, py, blueprint.visionRadius ?? 2)])
    );

  // 1. NPC interaction
  if (state.flags?.npc_interactions !== false) {
    const npc = (floor.npcs ?? []).find((n) => n.x === tx && n.y === ty);
    if (npc) {
      return { activeNpcId: npc.id, logs: pushLog(`💬 Spoke with ${npc.name}.`) };
    }
  }

  // 2. Melee bump enemy
  const floorEnemies = enemiesByFloor[currentFloorId] ?? [];
  const enemyIdx = floorEnemies.findIndex((e) => e.currentHp > 0 && e.x === tx && e.y === ty);
  if (enemyIdx !== -1) {
    return resolveMeleeBump(
      state,
      enemyIdx,
      tx,
      ty,
      reveal,
      (enemies, opened) => isFloorCleared(state.isEndless, floor, enemies, opened),
      tickPlayerTurn
    );
  }

  // 3. Chest
  const chest = (floor.chests ?? []).find(
    (c) => c.x === tx && c.y === ty && !openedChests.includes(c.id)
  );
  if (chest) {
    const nextPotions = [...potions];
    const nextGear = [...gearBag];
    let updatedPlayer = { ...player, x: tx, y: ty };
    let msg = "";

    if (chest.itemType === "potion") {
      nextPotions.push({ id: `${chest.id}-${Date.now()}`, name: chest.itemName, healAmount: chest.value });
      msg = `📦 Found ${chest.itemName} (+${chest.value} HP potion)!`;
    } else {
      const item: GearItem = {
        id: `${chest.id}-${Date.now()}`,
        slot: chest.itemType,
        name: chest.itemName,
        bonus: chest.value,
        element: chest.element ?? "none",
      };

      const currentGear = updatedPlayer.equippedGear ?? {};
      const existing = currentGear[item.slot];

      if (!existing || item.bonus > existing.bonus) {
        const sellGold = existing ? getGearSellPrice(existing) : 0;
        updatedPlayer = recalculateStats({
          ...updatedPlayer,
          gold: updatedPlayer.gold + sellGold,
          equippedGear: { ...currentGear, [item.slot]: item },
        });
        msg = existing
          ? `📦 Equipped ${item.name} (+${item.bonus}) & auto-sold ${existing.name} (+${sellGold}g)!`
          : `📦 Looted & equipped ${item.name} (+${item.bonus})!`;
      } else {
        const sellGold = getGearSellPrice(item);
        updatedPlayer = { ...updatedPlayer, gold: updatedPlayer.gold + sellGold };
        msg = `📦 Found ${item.name} (weaker) — auto-sold for +${sellGold}g!`;
      }
    }

    const nextOpened = [...openedChests, chest.id];
    const { updatedQuests, readyMessages } = incrementQuestProgress(
      state.activeQuests,
      "open_chests"
    );
    const cleared = isFloorCleared(state.isEndless, floor, floorEnemies, nextOpened);

    return {
      status: cleared ? "victory" : "playing",
      openedChests: nextOpened,
      exploredTiles: reveal(currentFloorId, tx, ty),
      potions: nextPotions,
      gearBag: nextGear,
      player: tickPlayerTurn(updatedPlayer),
      activeQuests: updatedQuests,
      turnsTaken: state.turnsTaken + 1,
      logs: [
        cleared ? `${msg} 🏆 All enemies defeated and all chests looted!` : msg,
        ...readyMessages,
        ...logs,
      ].slice(0, 30),
    };
  }

  // 4. Stairway
  if (tile === "S") {
    const stairs = floor.stairways.find((s) => s.from.x === tx && s.from.y === ty);
    if (stairs) {
      const dest = blueprint.floors.find((f) => f.id === stairs.toFloorId);
      return {
        currentFloorId: stairs.toFloorId,
        exploredTiles: reveal(stairs.toFloorId, stairs.to.x, stairs.to.y),
        turnsTaken: state.turnsTaken + 1,
        player: tickPlayerTurn({ ...player, x: stairs.to.x, y: stairs.to.y }),
        logs: pushLog(`🪜 ${stairs.label ?? `Moved to ${dest?.name ?? stairs.toFloorId}`}.`),
      };
    }
  }

  // 5. Healing shrine
  const shrineKey = `${currentFloorId}:${tx},${ty}`;
  if (tile === "H" && !usedShrines.includes(shrineKey)) {
    const healedHp = Math.min(player.maxHp, player.hp + Math.ceil(player.maxHp * 0.5));
    return {
      usedShrines: [...usedShrines, shrineKey],
      exploredTiles: reveal(currentFloorId, tx, ty),
      player: tickPlayerTurn({ ...player, x: tx, y: ty, hp: healedHp, statuses: [] }),
      turnsTaken: state.turnsTaken + 1,
      logs: pushLog(`✨ Rested at Healing Shrine (+${healedHp - player.hp} HP & cleansed statuses)!`),
    };
  }

  // 6. Standard move
  return {
    exploredTiles: reveal(currentFloorId, tx, ty),
    turnsTaken: state.turnsTaken + 1,
    player: tickPlayerTurn({ ...player, x: tx, y: ty }),
  };
}

function applyEnemyAiPhase(
  state: TurnState,
  result: Partial<TurnState>
): Partial<TurnState> {
  const nextStatus = result.status ?? state.status;
  if (nextStatus !== "playing") return result;

  const activeFloorId = result.currentFloorId ?? state.currentFloorId;
  const floor = state.blueprint.floors.find((f) => f.id === activeFloorId);
  if (!floor) return result;

  const enemiesMap = result.enemiesByFloor ?? state.enemiesByFloor;
  const floorEnemies = enemiesMap[activeFloorId] ?? [];
  const activePlayer = result.player ?? state.player;
  const smartAi = state.flags?.smart_enemy_ai !== false;

  const ai = runEnemyTurnPhase(floor, floorEnemies, activePlayer, smartAi);
  const clearedAfterDot = isFloorCleared(
    state.isEndless,
    floor,
    ai.updatedEnemies,
    result.openedChests ?? state.openedChests
  );

  return {
    ...result,
    status: ai.playerDefeated ? "defeat" : clearedAfterDot ? "victory" : "playing",
    enemiesByFloor: { ...enemiesMap, [activeFloorId]: ai.updatedEnemies },
    player: ai.updatedPlayer,
    logs: [...ai.aiLogs, ...(result.logs ?? state.logs)].slice(0, 30),
  };
}

export function resolveRangedAttack(state: TurnState, enemyId?: string): Partial<TurnState> {
  return applyEnemyAiPhase(state, computeRangedAttack(state, enemyId));
}

export function resolveMove(state: TurnState, dx: number, dy: number): Partial<TurnState> {
  const res = computeMove(state, dx, dy);
  if (!res.turnsTaken) return res;
  return applyEnemyAiPhase(state, res);
}