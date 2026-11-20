import type { RpgBlueprint, RpgHeroClass } from "./schema";
import type { ActiveEnemy, PlayerRuntimeState, PotionItem } from "./runtime-types";
import { type GearItem, type GearSlot, SLOT_META } from "./gear-perks";
import { incrementQuestProgress } from "./quest-helpers";
import {
  applyElementalHit,
  consumeFreeze,
  getEffectivePlayerElement,
} from "./elemental-helpers";
import { checkBossPhase2Transform } from "./boss-phase-helper";
import type { TurnState } from "./turn-resolver";

const MONSTER_DROPS: { slot: GearSlot; name: string; bonus: number }[] = [
  { slot: "helmet", name: "Iron Helm", bonus: 2 },
  { slot: "boots", name: "Scout Boots", bonus: 2 },
  { slot: "ring", name: "Vampiric Ring", bonus: 2 },
  { slot: "weapon", name: "Tempered Blade", bonus: 3 },
  { slot: "armor", name: "Chain Hauberk", bonus: 2 },
];

export function getRevealedKeys(floorId: string, cx: number, cy: number, radius: number): string[] {
  const keys: string[] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= radius + 1) {
        keys.push(`${floorId}:${cx + dx},${cy + dy}`);
      }
    }
  }
  return keys;
}

export function buildInitialEnemies(blueprint: RpgBlueprint): Record<string, ActiveEnemy[]> {
  const map: Record<string, ActiveEnemy[]> = {};
  for (const floor of blueprint.floors) {
    map[floor.id] = floor.enemies.map((e) => ({
      ...e,
      currentHp: e.hp,
      statuses: [],
      isChargingSpecial: false,
      specialCooldown: e.specialAttack?.cooldown ?? 3,
      hasTransformed: false,
    }));
  }
  return map;
}

export function recalculateStats(player: PlayerRuntimeState): PlayerRuntimeState {
  const gear = player.equippedGear ?? {};
  let atkBonus = 0;
  let defBonus = 0;

  (Object.values(gear) as (GearItem | undefined)[]).forEach((item) => {
    if (!item) return;
    if (SLOT_META[item.slot].statType === "ATK") atkBonus += item.bonus;
    else defBonus += item.bonus;
  });

  const helmetRangeBonus = gear.helmet ? 1 : 0;
  const effectiveRange =
    player.combatType === "ranged" ? player.baseRange + helmetRangeBonus : 1;

  return {
    ...player,
    atk: player.baseAtk + atkBonus,
    def: player.baseDef + defBonus,
    range: effectiveRange,
  };
}

export function buildStartingHero(
  blueprint: RpgBlueprint,
  chosenClass?: RpgHeroClass,
  customName?: string
): { player: PlayerRuntimeState; potions: PotionItem[]; gearBag: GearItem[]; startLog: string } {
  const cleanName = customName?.trim() || chosenClass?.name || blueprint.player.name;
  const maxHp = chosenClass?.maxHp ?? blueprint.player.maxHp;
  const baseAtk = chosenClass?.atk ?? blueprint.player.atk;
  const baseDef = chosenClass?.def ?? blueprint.player.def;
  const sprite = chosenClass?.sprite ?? blueprint.player.sprite;
  const combatType = chosenClass?.combatType ?? "melee";
  const baseRange = combatType === "ranged" ? Math.max(2, chosenClass?.range ?? 3) : 1;

  const potions: PotionItem[] = [];
  const gearBag: GearItem[] = [];
  const equippedGear: Partial<Record<GearSlot, GearItem>> = {};

  const starterItems = chosenClass?.starterItems ?? [
    { itemType: "potion" as const, itemName: "Minor Healing Potion", value: 35, element: "none" as const },
  ];

  starterItems.forEach((item, idx) => {
    if (item.itemType === "potion") {
      potions.push({
        id: `starter-pot-${idx}-${Date.now()}`,
        name: item.itemName,
        healAmount: item.value,
      });
    } else {
      const slot = item.itemType as GearSlot;
      const gear: GearItem = {
        id: `starter-gear-${idx}-${Date.now()}`,
        slot,
        name: item.itemName,
        bonus: item.value,
        element: item.element ?? "none",
      };

      if (!equippedGear[slot]) {
        equippedGear[slot] = gear;
      } else {
        gearBag.push(gear);
      }
    }
  });

  const player = recalculateStats({
    name: cleanName,
    className: chosenClass?.name ?? "Adventurer",
    sprite,
    spriteFrame2: chosenClass?.spriteFrame2 ?? blueprint.player.spriteFrame2,
    combatType,
    baseRange,
    range: baseRange,
    x: blueprint.player.startX,
    y: blueprint.player.startY,
    hp: maxHp,
    maxHp,
    baseAtk,
    baseDef,
    atk: baseAtk,
    def: baseDef,
    equippedGear,
    element: chosenClass?.element ?? "none",
    statuses: [],
    skill: chosenClass?.skill,
    skillCooldown: 0,
    gold: 25,
    xp: 0,
    level: 1,
  });

  const classLabel = chosenClass ? ` as ${chosenClass.name}` : "";
  return {
    player,
    potions,
    gearBag,
    startLog: `${cleanName} entered ${blueprint.title}${classLabel}.`,
  };
}

export function applyXpAndLevel(player: PlayerRuntimeState, xpGain: number) {
  let xp = player.xp + xpGain;
  let level = player.level;
  let maxHp = player.maxHp;
  let hp = player.hp;
  let baseAtk = player.baseAtk;
  let baseDef = player.baseDef;
  let levelMsg = "";

  const threshold = level * 50;
  if (xp >= threshold) {
    xp -= threshold;
    level += 1;
    maxHp += 15;
    hp = maxHp;
    baseAtk += 3;
    baseDef += 1;
    levelMsg = ` Level Up! Lv.${level} (+15 Max HP, +3 Base ATK, +1 Base DEF).`;
  }

  return {
    updatedPlayer: recalculateStats({ ...player, xp, level, maxHp, hp, baseAtk, baseDef }),
    levelMsg,
  };
}
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

  const playerElement = getEffectivePlayerElement(activeHero);
  const hitFx = applyElementalHit(enemy.statuses ?? [], playerElement);
  const freezeCheck = consumeFreeze(hitFx.nextStatuses);

  const p2 = checkBossPhase2Transform({
    ...enemy,
    currentHp: nextEnemyHp,
    statuses: freezeCheck.nextStatuses,
  });
  updatedEnemies[enemyIndex] = p2.enemy;
  const p2Logs = p2.transformLog ? [p2.transformLog] : [];

  if (freezeCheck.wasFrozen) {
    return {
      enemiesByFloor: { ...enemiesByFloor, [currentFloorId]: updatedEnemies },
      player: tickFn(activeHero),
      logs: [
        ...p2Logs,
        `⚔️ Hit ${enemy.name} (${dmg} dmg).${lifestealNote}${hitFx.note} ❄️ ${p2.enemy.name} is frozen and skips its counter!`,
        ...logs,
      ].slice(0, 30),
    };
  }

  if (gear.boots && Math.random() < 0.15) {
    return {
      enemiesByFloor: { ...enemiesByFloor, [currentFloorId]: updatedEnemies },
      player: tickFn(activeHero),
      logs: [
        ...p2Logs,
        `⚔️ Hit ${enemy.name} (${dmg} dmg).${lifestealNote}${hitFx.note} 👢 Dodged counter-attack!`,
        ...logs,
      ].slice(0, 30),
    };
  }

  const counter = Math.max(1, p2.enemy.atk - activeHero.def);
  const nextHp = Math.max(0, activeHero.hp - counter);
  const enemyFx = applyElementalHit(activeHero.statuses ?? [], p2.enemy.element);

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
      ...p2Logs,
      nextHp === 0
        ? `💀 ${p2.enemy.name} countered for ${counter} dmg. You fell in battle!`
        : `⚔️ Hit ${enemy.name} (${dmg} dmg).${lifestealNote}${hitFx.note} Took ${counter} dmg!${thornsNote}${enemyFx.note}`,
      ...logs,
    ].slice(0, 30),
  };
}
