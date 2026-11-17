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

  initGame: (blueprint: RpgBlueprint, isEndless?: boolean) => void;
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
export const useGameStore = create<GameStore>((set, get) => ({
  blueprint: null,
  isEndless: false,
  endlessDepth: 1,
  status: "idle",
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

  initGame: (blueprint, isEndless = false) =>
    set({
      blueprint,
      isEndless,
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
    const { player, potions, gearBag, startLog } = buildStartingHero(blueprint, chosen, customName);
    set({
      status: "playing",
      selectedClassId: chosen?.id ?? null,
      customHeroName: customName ?? "",
      currentFloorId: blueprint.player.startFloorId,
      activeNpcId: null,
      player,
      enemiesByFloor: buildInitialEnemies(blueprint),
      usedShrines: [],
      openedChests: [],
      exploredTiles: getRevealedKeys(
        blueprint.player.startFloorId,
        blueprint.player.startX,
        blueprint.player.startY,
        blueprint.visionRadius ?? 2
      ),
      potions,
      gearBag,
      activeQuests: [],
      completedQuestIds: [],
      logs: [startLog],
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
      logs: ["💾 Resumed saved run!", ...snapshot.logs].slice(0, 30),
    });
  },

  descendEndlessDepth: () => {
    const { blueprint, player, endlessDepth, logs } = get();
    if (!blueprint || !player) return;
    const nextDepth = endlessDepth + 1;
    const { floor, spawnX, spawnY } = generateEndlessFloor(nextDepth);
    const enemies = floor.enemies.map((e) => ({ ...e, currentHp: e.hp, statuses: [] }));
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
      exploredTiles: getRevealedKeys(floor.id, spawnX, spawnY, blueprint.visionRadius ?? 2),
      logs: [`⬇️ Descended into Endless Depth ${nextDepth}!`, ...logs].slice(0, 30),
    });
  },

  resetGame: () => {
    const { blueprint, isEndless, initGame } = get();
    if (blueprint) initGame(blueprint, isEndless);
  },

  usePotion: (potionId) => {
    const { status, player, potions, logs } = get();
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
      logs: [`🧪 Drank ${potion.name} (+${healedHp - player.hp} HP)!`, ...logs].slice(0, 30),
    });
  },

  equipGear: (gearId) => {
    const { status, player, gearBag, logs } = get();
    if (status !== "playing" || !player) return;
    const item = gearBag.find((g) => g.id === gearId);
    if (!item) return;
    const currentGear = player.equippedGear ?? {};
    const replaced = currentGear[item.slot];
    const earnedGold = replaced && replaced.id !== item.id ? getGearSellPrice(replaced) : 0;
    const nextBag = gearBag.filter((g) => g.id !== gearId && g.id !== replaced?.id);
    const nextPlayer = recalculateStats({
      ...player,
      gold: player.gold + earnedGold,
      equippedGear: { ...currentGear, [item.slot]: item },
    });
    const sellNote = replaced ? ` Auto-sold ${replaced.name} for +${earnedGold}g!` : "";
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
      shopItemId
    );
    if (res) set(res);
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
      npcId
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
      questId
    );
    if (res) set(res);
  },

  rangedAttack: (enemyId) => {
    const s = get();
    if (!s.blueprint || !s.player || s.status !== "playing") return;
    set(resolveRangedAttack({ ...s, blueprint: s.blueprint, player: s.player }, enemyId));
  },

  triggerClassSkill: () => {
    const s = get();
    if (!s.blueprint || !s.player || s.status !== "playing") return;
    set(resolveClassSkill({ ...s, blueprint: s.blueprint, player: s.player }));
  },

  movePlayer: (dx, dy) => {
    const s = get();
    if (!s.blueprint || !s.player || s.status !== "playing") return;
    set(resolveMove({ ...s, blueprint: s.blueprint, player: s.player }, dx, dy));
  },
}));
