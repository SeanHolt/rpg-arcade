import type { GearItem, GearSlot } from "./gear-perks";
export type { GearItem, GearSlot };
import type { ElementType, RpgBlueprint, RpgEnemy, RpgStarterItem } from "./schema";

export type GameStatus =
  | "idle"
  | "selecting"
  | "playing"
  | "victory"
  | "defeat";

export type ActiveEnemy = RpgEnemy & {
  currentHp: number;
  statuses: ActiveStatusEffect[];
};

export type PotionItem = {
  id: string;
  name: string;
  healAmount: number;
};

export type ActiveStatusEffect = {
  type: "burn" | "freeze" | "poison";
  turnsLeft: number;
};
export type PlayerRuntimeState = {
  name: string;
  className: string;
  sprite: string;
  combatType: "melee" | "ranged";
  range: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  baseAtk: number;
  baseDef: number;
  atk: number;
  def: number;
  skill?: {
    name: string;
    type: "cleave" | "piercing_shot" | "mend" | "blink";
    cooldown: number;
  };
  skillCooldown: number;
  baseRange: number;
  equippedGear: Partial<Record<GearSlot, GearItem>>;
  gold: number;
  xp: number;
  level: number;
  element: ElementType;
  statuses: ActiveStatusEffect[];
};

export type SerializedRunSnapshot = {
  blueprint?: RpgBlueprint;
  endlessDepth?: number;
  currentFloorId: string;
  player: PlayerRuntimeState;
  enemiesByFloor: Record<string, ActiveEnemy[]>;
  usedShrines: string[];
  openedChests: string[];
  exploredTiles: string[];
  potions: PotionItem[];
  gearBag: GearItem[];
  logs: string[];
  activeQuests?: ActiveQuestProgress[];
  completedQuestIds?: string[];
};
export type ActiveQuestProgress = {
  questId: string;
  npcId: string;
  npcName: string;
  title: string;
  goalType: "kill_enemies" | "open_chests";
  currentCount: number;
  targetCount: number;
  rewardGold: number;
  rewardXp: number;
  rewardItem?: RpgStarterItem;
};
