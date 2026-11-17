import type {
  ActiveEnemy,
  GearItem,
  GearSlot,
  PlayerRuntimeState,
} from "./runtime-types";
import { applyXpAndLevel } from "./combat-helpers";
import { incrementQuestProgress } from "./quest-helpers";
import {
  applyElementalHit,
  consumeFreeze,
  getEffectivePlayerElement,
} from "./elemental-helpers";
import type { TurnState } from "./turn-resolver";

const MONSTER_DROPS: { slot: GearSlot; name: string; bonus: number }[] = [
  { slot: "helmet", name: "Iron Helm", bonus: 2 },
  { slot: "boots", name: "Scout Boots", bonus: 2 },
  { slot: "ring", name: "Vampiric Ring", bonus: 2 },
  { slot: "weapon", name: "Tempered Blade", bonus: 3 },
  { slot: "armor", name: "Chain Hauberk", bonus: 2 },
];
export function resolveMeleeBump(
  state: TurnState,
  enemyIndex: number,
  tx: number,
  ty: number,
  revealFn: (fId: string, px: number, py: number) => string[],
  isClearedFn: (enemies: ActiveEnemy[], opened: string[]) => boolean,
  tickFn: (p: PlayerRuntimeState) => PlayerRuntimeState,
): Partial<TurnState> {
  const {
    currentFloorId,
    player,
    enemiesByFloor,
    openedChests,
    activeQuests,
    logs,
  } = state;
  const floorEnemies = enemiesByFloor[currentFloorId] ?? [];
  const enemy = floorEnemies.at(enemyIndex)!;

  const gear = player.equippedGear ?? {};
  const healedHp = gear.ring
    ? Math.min(player.maxHp, player.hp + 3)
    : player.hp;
  const lifestealNote =
    gear.ring && healedHp > player.hp ? " 💍 +3 HP Lifesteal!" : "";
  const activeHero = { ...player, hp: healedHp };

  const dmg = Math.max(1, activeHero.atk - enemy.def);
  const nextEnemyHp = Math.max(0, enemy.currentHp - dmg);
  const updatedEnemies = [...floorEnemies];

  // 1. Enemy Defeated
  if (nextEnemyHp === 0) {
    updatedEnemies[enemyIndex] = { ...enemy, currentHp: 0, statuses: [] };
    const goldMultiplier = gear.ring ? 1.5 : 1;
    const goldDrop = Math.max(
      5,
      Math.round((enemy.xpReward / 2) * goldMultiplier),
    );
    let nextGearBag = state.gearBag;
    let dropNote = "";
    if (Math.random() < 0.25) {
      const tpl =
        MONSTER_DROPS[Math.floor(Math.random() * MONSTER_DROPS.length)];
      const dropped: GearItem = {
        id: `drop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        slot: tpl.slot,
        name: tpl.name,
        bonus: tpl.bonus,
        element: "none",
      };
      nextGearBag = [...nextGearBag, dropped];
      dropNote = ` 🎁 Dropped ${dropped.name}!`;
    }
    const { updatedPlayer, levelMsg } = applyXpAndLevel(
      { ...activeHero, x: tx, y: ty, gold: activeHero.gold + goldDrop },
      enemy.xpReward,
    );
    const { updatedQuests, readyMessages } = incrementQuestProgress(
      activeQuests,
      "kill_enemies",
    );
    const cleared = isClearedFn(updatedEnemies, openedChests);

    const msg = cleared
      ? `🏆 Defeated ${enemy.name} and cleared the entire floor! ${dropNote}`
      : `⚔️ Defeated ${enemy.name} (+${enemy.xpReward} XP, +${goldDrop} Gold)!${lifestealNote}${levelMsg}${dropNote}`;

    return {
        gearBag: nextGearBag,
      status: cleared ? "victory" : "playing",
      enemiesByFloor: { ...enemiesByFloor, [currentFloorId]: updatedEnemies },
      exploredTiles: revealFn(currentFloorId, tx, ty),
      player: tickFn(updatedPlayer),
      activeQuests: updatedQuests,
      logs: [msg, ...readyMessages, ...logs].slice(0, 30),
    };
  }

  // 2. Enemy Survives — Apply Player Elemental Effect
  const playerElement = getEffectivePlayerElement(activeHero);
  const hitFx = applyElementalHit(enemy.statuses ?? [], playerElement);
  const freezeCheck = consumeFreeze(hitFx.nextStatuses);

  updatedEnemies[enemyIndex] = {
    ...enemy,
    currentHp: nextEnemyHp,
    statuses: freezeCheck.nextStatuses,
  };

  if (freezeCheck.wasFrozen) {
    return {
      enemiesByFloor: { ...enemiesByFloor, [currentFloorId]: updatedEnemies },
      player: tickFn(activeHero),
      logs: [
        `⚔️ Hit ${enemy.name} (${dmg} dmg).${lifestealNote}${hitFx.note} ❄️ ${enemy.name} is frozen and skips its counter!`,
        ...logs,
      ].slice(0, 30),
    };
  }

  // 3. Boots Dodge Check (15% chance)
  if (gear.boots && Math.random() < 0.15) {
    return {
      enemiesByFloor: { ...enemiesByFloor, [currentFloorId]: updatedEnemies },
      player: tickFn(activeHero),
      logs: [
        `⚔️ Hit ${enemy.name} (${dmg} dmg).${lifestealNote}${hitFx.note} 👢 Dodged counter-attack!`,
        ...logs,
      ].slice(0, 30),
    };
  }

  // 4. Enemy Counter-Attacks + Armor Thorns Reflect (+2 dmg)
  const counter = Math.max(1, enemy.atk - activeHero.def);
  const nextHp = Math.max(0, activeHero.hp - counter);
  const enemyFx = applyElementalHit(activeHero.statuses ?? [], enemy.element);

  let thornsNote = "";
  if (gear.armor) {
    const reflectedHp = Math.max(0, nextEnemyHp - 2);
    updatedEnemies[enemyIndex] = {
      ...updatedEnemies[enemyIndex],
      currentHp: reflectedHp,
    };
    thornsNote = " 🛡️ +2 Thorns!";
  }

  const nextPlayer = tickFn({
    ...activeHero,
    hp: nextHp,
    statuses: enemyFx.nextStatuses,
  });

  return {
    status: nextHp === 0 ? "defeat" : "playing",
    enemiesByFloor: { ...enemiesByFloor, [currentFloorId]: updatedEnemies },
    player: nextPlayer,
    logs: [
      nextHp === 0
        ? `💀 ${enemy.name} countered for ${counter} dmg. You fell in battle!`
        : `⚔️ Hit ${enemy.name} (${dmg} dmg).${lifestealNote}${hitFx.note} Took ${counter} dmg!${thornsNote}${enemyFx.note}`,
      ...logs,
    ].slice(0, 30),
  };
}
