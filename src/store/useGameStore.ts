import { create } from "zustand";
import type { RpgBlueprint } from "@/lib/rpg/schema";
import type {
  ActiveEnemy,
  ActiveQuestProgress,
  GameStatus,
  GearItem,
  PlayerRuntimeState,
  PotionItem,
  SerializedRunSnapshot,
} from "@/lib/rpg/runtime-types";
import { getGearSellPrice } from "@/lib/rpg/gear-perks";
import {
  buildInitialEnemies,
  buildStartingHero,
  getRevealedKeys,
  recalculateStats,
} from "@/lib/rpg/combat-helpers";
import { generateEndlessFloor } from "@/lib/rpg/endless-generator";
import { resolveMove, resolveRangedAttack } from "@/lib/rpg/turn-resolver";
import { resolveClassSkill } from "@/lib/rpg/skill-resolver";
import {
  executeQuestAccept,
  executeQuestClaim,
  executeShopPurchase,
} from "@/lib/rpg/npc-actions";
import {
  getDefaultFeatureFlags,
  type FeatureFlagsMap,
} from "@/lib/feature-flag-defs";
import { playSfxFromTransition } from "@/lib/audio/sfx-observer";

export type {
  ActiveEnemy,
  ActiveQuestProgress,
  GameStatus,
  GearItem,
  PlayerRuntimeState,
  PotionItem,
};

type GameStore = {
  blueprint: RpgBlueprint | null;
  isEndless: boolean;
  endlessDepth: number;
  status: GameStatus;
  selectedClassId: string | null;
  customHeroName: string;
  currentFloorId: string;
  activeNpcId: string | null;
  player: PlayerRuntimeState | null;
  enemiesByFloor: Record<string, ActiveEnemy[]>;
  usedShrines: string[];
  openedChests: string[];
  exploredTiles: string[];
  potions: PotionItem[];
  gearBag: GearItem[];
  activeQuests: ActiveQuestProgress[];
  completedQuestIds: string[];
  logs: string[];
  flags: FeatureFlagsMap;
  turnsTaken: number;
  brokenWalls: string[];
  activeSignId: string | null;
  blockPositions: Record<string, { x: number; y: number }>;
  pulledLevers: string[];
  solvedRiddleIds: string[];

  closeSignModal: () => void;
  answerSignRiddle: (signId: string, optionIndex: number) => void;
  initGame: (
    blueprint: RpgBlueprint,
    isEndless?: boolean,
    flags?: FeatureFlagsMap,
  ) => void;
  startRun: (classId?: string, customName?: string) => void;
  restoreSnapshot: (snapshot: SerializedRunSnapshot) => void;
  descendEndlessDepth: () => void;
  resetGame: () => void;
  movePlayer: (dx: number, dy: number) => void;
  rangedAttack: (enemyId?: string) => void;
  triggerClassSkill: () => void;
  usePotion: (potionId: string) => void;
  equipGear: (gearId: string) => void;
  sellGear: (gearId: string) => void;
  closeNpcDialogue: () => void;
  buyShopItem: (npcId: string, shopItemId: string) => void;
  acceptQuest: (npcId: string) => void;
  claimQuestReward: (questId: string) => void;
};
function snapOf(s: {
  status: GameStatus;
  player: PlayerRuntimeState | null;
  openedChests: string[];
  usedShrines: string[];
  logs: string[];
}) {
  return {
    status: s.status,
    player: s.player,
    openedChestsCount: s.openedChests.length,
    usedShrinesCount: s.usedShrines.length,
    logsTop: s.logs.at(0),
  };
}
export const useGameStore = create<GameStore>((set, get) => ({
  blueprint: null,
  isEndless: false,
  endlessDepth: 1,
  status: "idle" as GameStatus,
  selectedClassId: null,
  customHeroName: "",
  currentFloorId: "",
  activeNpcId: null,
  player: null,
  enemiesByFloor: {},
  usedShrines: [],
  openedChests: [],
  exploredTiles: [],
  potions: [],
  gearBag: [],
  activeQuests: [],
  completedQuestIds: [],
  logs: [],
  flags: getDefaultFeatureFlags(),
  turnsTaken: 0,
  brokenWalls: [],
  activeSignId: null,
  blockPositions: {},
  pulledLevers: [],
  solvedRiddleIds: [],

  closeSignModal: () => set({ activeSignId: null }),
  answerSignRiddle: (signId, optionIndex) => {
  const { blueprint, currentFloorId, player, solvedRiddleIds, logs } = get();
  if (!blueprint || !player || solvedRiddleIds.includes(signId)) return;
  const floor = blueprint.floors.find((f) => f.id === currentFloorId);
  const sign = floor?.signs?.find((s) => s.id === signId);
  if (!sign?.riddle) return;

  if (optionIndex !== sign.riddle.correctIndex) {
    set({
      logs: [`❌ Incorrect answer on "${sign.title}". Try again!`, ...logs].slice(0, 30),
    });
    return;
  }

  const nextGold = player.gold + sign.riddle.rewardGold;
  const nextXp = player.xp + sign.riddle.rewardXp;
  const xpThreshold = player.level * 50;
  const leveledUp = nextXp >= xpThreshold;

  set({
    solvedRiddleIds: [...solvedRiddleIds, signId],
    activeSignId: null,
    player: {
      ...player,
      gold: nextGold,
      xp: leveledUp ? nextXp - xpThreshold : nextXp,
      level: leveledUp ? player.level + 1 : player.level,
      maxHp: leveledUp ? player.maxHp + 12 : player.maxHp,
      hp: leveledUp ? player.maxHp + 12 : player.hp,
      atk: leveledUp ? player.atk + 2 : player.atk,
      def: leveledUp ? player.def + 1 : player.def,
    },
    logs: [
      `🧩 Solved "${sign.title}"! Earned +${sign.riddle.rewardGold}g & +${sign.riddle.rewardXp} XP!`,
      ...logs,
    ].slice(0, 30),
  });
},
  initGame: (blueprint, isEndless = false, flags) =>
    set({
      blueprint,
      isEndless,
      flags: flags ?? getDefaultFeatureFlags(),
      endlessDepth: 1,
      status: "selecting",
      selectedClassId: blueprint.classes?.at(0)?.id ?? null,
      customHeroName: "",
      activeNpcId: null,
      player: null,
    }),

  startRun: (classId, customName) => {
    const { blueprint } = get();
    if (!blueprint) return;
    const chosen = blueprint.classes?.find((c) => c.id === classId);
    const { player, potions, gearBag, startLog } = buildStartingHero(
      blueprint,
      chosen,
      customName,
    );
    set({
      status: "playing",
      selectedClassId: chosen?.id ?? null,
      customHeroName: customName ?? "",
      currentFloorId: blueprint.player.startFloorId,
      activeNpcId: null,
      player,
      enemiesByFloor: buildInitialEnemies(blueprint),
      usedShrines: [],
      turnsTaken: 0,
      openedChests: [],
      exploredTiles: getRevealedKeys(
        blueprint.player.startFloorId,
        blueprint.player.startX,
        blueprint.player.startY,
        blueprint.visionRadius ?? 2,
      ),
      potions,
      gearBag,
      activeQuests: [],
      completedQuestIds: [],
      logs: [startLog],
      brokenWalls: [],
    });
  },

  restoreSnapshot: (snapshot) => {
    const activeBlueprint = snapshot.blueprint ?? get().blueprint;
    if (!activeBlueprint) return;
    set({
      blueprint: activeBlueprint,
      endlessDepth: snapshot.endlessDepth ?? get().endlessDepth,
      status: "playing",
      activeNpcId: null,
      currentFloorId: snapshot.currentFloorId,
      player: snapshot.player,
      enemiesByFloor: snapshot.enemiesByFloor,
      usedShrines: snapshot.usedShrines,
      openedChests: snapshot.openedChests,
      exploredTiles: snapshot.exploredTiles,
      potions: snapshot.potions,
      gearBag: snapshot.gearBag,
      activeQuests: snapshot.activeQuests ?? [],
      completedQuestIds: snapshot.completedQuestIds ?? [],
      turnsTaken: snapshot.turnsTaken ?? 0,
      brokenWalls: snapshot.brokenWalls ?? [],
      logs: ["💾 Resumed saved run!", ...snapshot.logs].slice(0, 30),
    });
  },

  descendEndlessDepth: () => {
    const { blueprint, player, endlessDepth, logs } = get();
    if (!blueprint || !player) return;
    const nextDepth = endlessDepth + 1;
    const { floor, spawnX, spawnY } = generateEndlessFloor(nextDepth);
    const enemies = floor.enemies.map((e) => ({
      ...e,
      currentHp: e.hp,
      statuses: [],
      isChargingSpecial: false,
      specialCooldown: e.specialAttack?.cooldown ?? 3,
    }));
    set({
      blueprint: { ...blueprint, floors: [floor] },
      status: "playing",
      endlessDepth: nextDepth,
      currentFloorId: floor.id,
      activeNpcId: null,
      player: { ...player, x: spawnX, y: spawnY },
      enemiesByFloor: { [floor.id]: enemies },
      usedShrines: [],
      openedChests: [],
      brokenWalls: [],
      exploredTiles: getRevealedKeys(floor.id, spawnX, spawnY, blueprint.visionRadius ?? 2),
      logs: [`⬇️ Descended into Endless Depth ${nextDepth}!`, ...logs].slice(0, 30),
    });
  },

  resetGame: () => {
    const { blueprint, isEndless, initGame } = get();
    if (blueprint) initGame(blueprint, isEndless);
  },

  usePotion: (potionId) => {
    const before = get()
    const { status, player, potions, logs } = before;
    if (status !== "playing" || !player) return;
    const potion = potions.find((p) => p.id === potionId);
    if (!potion) return;
    if (player.hp >= player.maxHp) {
      set({ logs: ["Your HP is already full!", ...logs].slice(0, 30) });
      return;
    }
    const healedHp = Math.min(player.maxHp, player.hp + potion.healAmount);
    set({
      player: { ...player, hp: healedHp },
      potions: potions.filter((p) => p.id !== potionId),
      logs: [
        `🧪 Drank ${potion.name} (+${healedHp - player.hp} HP)!`,
        ...logs,
      ].slice(0, 30),
    });
    playSfxFromTransition("potion", snapOf(before), snapOf(get()))
  },

  equipGear: (gearId) => {
    const { status, player, gearBag, logs } = get();
    if (status !== "playing" || !player) return;
    const item = gearBag.find((g) => g.id === gearId);
    if (!item) return;
    const currentGear = player.equippedGear ?? {};
    const replaced = currentGear[item.slot];
    const earnedGold =
      replaced && replaced.id !== item.id ? getGearSellPrice(replaced) : 0;
    const nextBag = gearBag.filter(
      (g) => g.id !== gearId && g.id !== replaced?.id,
    );
    const nextPlayer = recalculateStats({
      ...player,
      gold: player.gold + earnedGold,
      equippedGear: { ...currentGear, [item.slot]: item },
    });
    const sellNote = replaced
      ? ` Auto-sold ${replaced.name} for +${earnedGold}g!`
      : "";
    set({
      player: nextPlayer,
      gearBag: nextBag,
      logs: [`🛡️ Equipped ${item.name}.${sellNote}`, ...logs].slice(0, 30),
    });
  },

  sellGear: (gearId) => {
    const { status, player, gearBag, logs } = get();
    if (status !== "playing" || !player) return;
    const item = gearBag.find((g) => g.id === gearId);
    if (!item) return;
    const goldValue = getGearSellPrice(item);
    set({
      player: { ...player, gold: player.gold + goldValue },
      gearBag: gearBag.filter((g) => g.id !== gearId),
      logs: [`💰 Sold ${item.name} for +${goldValue}g!`, ...logs].slice(0, 30),
    });
  },

  closeNpcDialogue: () => set({ activeNpcId: null }),

  buyShopItem: (npcId, shopItemId) => {
    const s = get();
    if (!s.blueprint || !s.player) return;
    const res = executeShopPurchase(
      s.blueprint,
      s.currentFloorId,
      s.player,
      s.potions,
      s.gearBag,
      s.logs,
      npcId,
      shopItemId,
    );
    if (res) set(res);
    playSfxFromTransition("potion", snapOf(s), snapOf(get()))
  },

  acceptQuest: (npcId) => {
    const s = get();
    if (!s.blueprint) return;
    const res = executeQuestAccept(
      s.blueprint,
      s.currentFloorId,
      s.activeQuests,
      s.completedQuestIds,
      s.logs,
      npcId,
    );
    if (res) set(res);
  },

  claimQuestReward: (questId) => {
    const s = get();
    if (!s.player) return;
    const res = executeQuestClaim(
      s.player,
      s.activeQuests,
      s.completedQuestIds,
      s.potions,
      s.gearBag,
      s.logs,
      questId,
    );
    if (res) set(res);
    playSfxFromTransition("quest", snapOf(s), snapOf(get()))
  },

  rangedAttack: (enemyId) => {
    const prev = get();
    if (!prev.blueprint || !prev.player || prev.status !== "playing") return;
    const before = snapOf(prev);
    set(
      resolveRangedAttack(
        { ...prev, blueprint: prev.blueprint, player: prev.player },
        enemyId,
      ),
    );
    playSfxFromTransition("ranged", before, snapOf(get()));
  },

  triggerClassSkill: () => {
    const prev = get();
    if (!prev.blueprint || !prev.player || prev.status !== "playing") return;
    if (!prev.flags.class_skills) {
      set({
        logs: ["⚠️ Class skills are currently disabled.", ...prev.logs].slice(
          0,
          30,
        ),
      });
      return;
    }
    const before = snapOf(prev);
    set(
      resolveClassSkill({
        ...prev,
        blueprint: prev.blueprint,
        player: prev.player,
      }),
    );
    playSfxFromTransition("skill", before, snapOf(get()));
  },

  movePlayer: (dx, dy) => {
    const prev = get();
    if (!prev.blueprint || !prev.player || prev.status !== "playing") return;
    const before = snapOf(prev);
    set(
      resolveMove(
        { ...prev, blueprint: prev.blueprint, player: prev.player, brokenWalls: prev.brokenWalls },
        dx,
        dy,
      ),
    );
    playSfxFromTransition("move", before, snapOf(get()));
  },
}));
