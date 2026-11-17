import type { TurnState } from "./turn-resolver";
import { applyXpAndLevel, getRevealedKeys } from "./combat-helpers";
import { incrementQuestProgress } from "./quest-helpers";

export function resolveClassSkill(state: TurnState): Partial<TurnState> {
  const { blueprint, currentFloorId, player, enemiesByFloor, logs } = state;
  const skill = player.skill;
  if (!skill) {
    return { logs: ["Your hero has no active class skill.", ...logs].slice(0, 30) };
  }

  if (player.skillCooldown > 0) {
    return {
      logs: [`⏳ ${skill.name} is recharging (${player.skillCooldown} turns left).`, ...logs].slice(0, 30),
    };
  }

  const floor = blueprint.floors.find((f) => f.id === currentFloorId);
  if (!floor) return {};

  // 1. MEND: Restore 35% of Max HP without spending a potion
  if (skill.type === "mend") {
    const heal = Math.max(10, Math.ceil(player.maxHp * 0.35));
    const nextHp = Math.min(player.maxHp, player.hp + heal);
    return {
      player: { ...player, hp: nextHp, skillCooldown: skill.cooldown },
      logs: [`✨ Used ${skill.name} and restored ${nextHp - player.hp} HP!`, ...logs].slice(0, 30),
    };
  }

  // 2. BLINK: Teleport 2 tiles in a cardinal direction toward an open walkable tile
  if (skill.type === "blink") {
    const dirs: [number, number][] = [[0, -2], [0, 2], [-2, 0], [2, 0]];
    const floorEnemies = enemiesByFloor[currentFloorId] ?? [];
    const dest = dirs
      .map(([dx, dy]) => ({ x: player.x + dx, y: player.y + dy }))
      .find((pos) => {
        const tile = floor.grid.at(pos.y)?.at(pos.x);
        const occupied = floorEnemies.some((e) => e.currentHp > 0 && e.x === pos.x && e.y === pos.y);
        return tile !== undefined && tile !== "#" && !occupied;
      });

    if (!dest) {
      return { logs: [`🌀 No open landing spot 2 tiles away for ${skill.name}!`, ...logs].slice(0, 30) };
    }

    const exploredTiles = Array.from(
      new Set([
        ...state.exploredTiles,
        ...getRevealedKeys(currentFloorId, dest.x, dest.y, blueprint.visionRadius ?? 2),
      ])
    );

    return {
      exploredTiles,
      player: { ...player, x: dest.x, y: dest.y, skillCooldown: skill.cooldown },
      logs: [`🌀 Used ${skill.name} and blinked to (${dest.x}, ${dest.y})!`, ...logs].slice(0, 30),
    };
  }

  // 3. CLEAVE (adjacent AoE) or PIERCING SHOT (ranged armor-ignoring strike)
  const floorEnemies = enemiesByFloor[currentFloorId] ?? [];
  const maxDist = skill.type === "cleave" ? 1 : Math.max(2, player.range);
  const targets = floorEnemies.filter((e) => {
    if (e.currentHp <= 0) return false;
    const dist = Math.abs(e.x - player.x) + Math.abs(e.y - player.y);
    return dist > 0 && dist <= maxDist;
  });

  if (targets.length === 0) {
    return {
      logs: [`⚔️ No enemies within ${maxDist} tile(s) for ${skill.name}!`, ...logs].slice(0, 30),
    };
  }

  const hitList = skill.type === "cleave" ? targets : [targets[0]];
  let updatedEnemies = [...floorEnemies];
  let updatedPlayer = { ...player, skillCooldown: skill.cooldown };
  let updatedQuests = state.activeQuests;
  const newLogs: string[] = [];

  for (const target of hitList) {
    const rawDmg =
      skill.type === "piercing_shot"
        ? Math.round(updatedPlayer.atk * 1.3)
        : Math.max(1, updatedPlayer.atk - target.def);
    const nextHp = Math.max(0, target.currentHp - rawDmg);

    updatedEnemies = updatedEnemies.map((e) =>
      e.id === target.id ? { ...e, currentHp: nextHp } : e
    );

    if (nextHp === 0) {
      const xpRes = applyXpAndLevel(updatedPlayer, target.xpReward);
      updatedPlayer = xpRes.updatedPlayer;
      const qRes = incrementQuestProgress(updatedQuests, "kill_enemies");
      updatedQuests = qRes.updatedQuests;
      newLogs.push(`💥 ${skill.name} defeated ${target.name} (+${target.xpReward} XP)!${xpRes.levelMsg}`);
      newLogs.push(...qRes.readyMessages);
    } else {
      newLogs.push(`💥 ${skill.name} hit ${target.name} for ${rawDmg} dmg (${nextHp}/${target.hp} HP)!`);
    }
  }

  const allDead = updatedEnemies.every((e) => e.currentHp <= 0);
  const allChests = (floor.chests ?? []).every((c) => state.openedChests.includes(c.id));
  const bossDead = updatedEnemies.some((e) => e.isBoss && e.currentHp <= 0);
  const victory = state.isEndless ? allDead && allChests : bossDead;

  return {
    status: victory ? "victory" : "playing",
    enemiesByFloor: { ...enemiesByFloor, [currentFloorId]: updatedEnemies },
    player: updatedPlayer,
    activeQuests: updatedQuests,
    logs: [...newLogs, ...logs].slice(0, 30),
  };
}
