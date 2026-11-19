import type { RpgBlueprint, RpgHeroClass } from "./schema";
import type { ActiveEnemy, PlayerRuntimeState, PotionItem } from "./runtime-types";
import { type GearItem, type GearSlot, SLOT_META } from "./gear-perks";

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
