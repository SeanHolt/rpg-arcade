import type { RpgBlueprint } from "./schema";
import type {
  ActiveQuestProgress,
  GearItem,
  PlayerRuntimeState,
  PotionItem,
} from "./runtime-types";
import { applyXpAndLevel } from "./combat-helpers";

export function executeShopPurchase(
  blueprint: RpgBlueprint,
  currentFloorId: string,
  player: PlayerRuntimeState,
  potions: PotionItem[],
  gearBag: GearItem[],
  logs: string[],
  npcId: string,
  shopItemId: string
) {
  const floor = blueprint.floors.find((f) => f.id === currentFloorId);
  const npc = floor?.npcs?.find((n) => n.id === npcId);
  const item = npc?.shopItems.find((s) => s.id === shopItemId);
  if (!npc || !item) return null;

  if (player.gold < item.goldCost) {
    return {
      logs: [`Not enough gold for ${item.itemName} (need ${item.goldCost}g).`, ...logs].slice(0, 30),
    };
  }

  const nextGold = player.gold - item.goldCost;
  if (item.itemType === "potion") {
    return {
      player: { ...player, gold: nextGold },
      potions: [
        ...potions,
        { id: `shop-${item.id}-${Date.now()}`, name: item.itemName, healAmount: item.value },
      ],
      logs: [`🛒 Bought ${item.itemName} for ${item.goldCost}g!`, ...logs].slice(0, 30),
    };
  }

  const gear: GearItem = {
    id: `shop-${item.id}-${Date.now()}`,
    slot: item.itemType,
    name: item.itemName,
    bonus: item.value,
    element: item.element ?? "none",
  };
  return {
    player: { ...player, gold: nextGold },
    gearBag: [...gearBag, gear],
    logs: [`🛒 Bought ${item.itemName} for ${item.goldCost}g! Added to Gear Bag.`, ...logs].slice(0, 30),
  };
}

export function executeQuestAccept(
  blueprint: RpgBlueprint,
  currentFloorId: string,
  activeQuests: ActiveQuestProgress[],
  completedQuestIds: string[],
  logs: string[],
  npcId: string
) {
  const floor = blueprint.floors.find((f) => f.id === currentFloorId);
  const npc = floor?.npcs?.find((n) => n.id === npcId);
  const quest = npc?.quest;
  if (!npc || !quest) return null;

  if (completedQuestIds.includes(quest.id) || activeQuests.some((q) => q.questId === quest.id)) {
    return null;
  }

  const nextQuest: ActiveQuestProgress = {
    questId: quest.id,
    npcId: npc.id,
    npcName: npc.name,
    title: quest.title,
    goalType: quest.goalType,
    currentCount: 0,
    targetCount: quest.targetCount,
    rewardGold: quest.rewardGold,
    rewardXp: quest.rewardXp,
    rewardItem: quest.rewardItem,
  };

  return {
    activeQuests: [...activeQuests, nextQuest],
    logs: [`📜 Accepted Quest: "${quest.title}" from ${npc.name}!`, ...logs].slice(0, 30),
  };
}

export function executeQuestClaim(
  player: PlayerRuntimeState,
  activeQuests: ActiveQuestProgress[],
  completedQuestIds: string[],
  potions: PotionItem[],
  gearBag: GearItem[],
  logs: string[],
  questId: string
) {
  const quest = activeQuests.find((q) => q.questId === questId);
  if (!quest || quest.currentCount < quest.targetCount) return null;

  const { updatedPlayer, levelMsg } = applyXpAndLevel(
    { ...player, gold: player.gold + quest.rewardGold },
    quest.rewardXp
  );

  const nextPotions = [...potions];
  const nextGear = [...gearBag];
  let itemNote = "";

  if (quest.rewardItem) {
    if (quest.rewardItem.itemType === "potion") {
      nextPotions.push({
        id: `quest-pot-${Date.now()}`,
        name: quest.rewardItem.itemName,
        healAmount: quest.rewardItem.value,
      });
    } else {
      nextGear.push({
        id: `quest-gear-${Date.now()}`,
        slot: quest.rewardItem.itemType,
        name: quest.rewardItem.itemName,
        bonus: quest.rewardItem.value,
        element: quest.rewardItem.element ?? "none",
      });
    }
    itemNote = ` + ${quest.rewardItem.itemName}`;
  }

  return {
    player: updatedPlayer,
    potions: nextPotions,
    gearBag: nextGear,
    activeQuests: activeQuests.filter((q) => q.questId !== questId),
    completedQuestIds: [...completedQuestIds, questId],
    logs: [
      `🎉 Completed "${quest.title}" (+${quest.rewardGold}g, +${quest.rewardXp} XP${itemNote})!${levelMsg}`,
      ...logs,
    ].slice(0, 30),
  };
}
