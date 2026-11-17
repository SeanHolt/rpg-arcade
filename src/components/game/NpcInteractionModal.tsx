"use client";

import type { RpgNpc } from "@/lib/rpg/schema";
import type { ActiveQuestProgress } from "@/lib/rpg/runtime-types";
import { SpriteDisplay } from "./SpriteDisplay";

type Props = {
  npc: RpgNpc;
  playerGold: number;
  activeQuest?: ActiveQuestProgress;
  isQuestCompleted: boolean;
  onAcceptQuest: () => void;
  onClaimQuest: (questId: string) => void;
  onBuyItem: (shopItemId: string) => void;
  onClose: () => void;
};

export function NpcInteractionModal({
  npc,
  playerGold,
  activeQuest,
  isQuestCompleted,
  onAcceptQuest,
  onClaimQuest,
  onBuyItem,
  onClose,
}: Props) {
  const quest = npc.quest;
  const isReady =
    Boolean(activeQuest) && activeQuest!.currentCount >= activeQuest!.targetCount;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950">
              <SpriteDisplay sprite={npc.sprite} sizeClass="h-8 w-8" textClass="text-2xl" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">{npc.name}</h3>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs uppercase text-amber-300">
                {npc.role === "merchant" ? "🛒 Merchant" : "💬 Villager / Sage"}
              </span>
            </div>
          </div>

          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-200">
          &ldquo;{npc.dialogue}&rdquo;
        </p>

        {quest && (
          <div className="space-y-2 rounded-xl border border-amber-700/50 bg-amber-950/30 p-3.5 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-300">
              <span>📜 Quest: {quest.title}</span>
              {isQuestCompleted && <span className="text-emerald-400">✓ Completed</span>}
            </div>
            <p className="text-zinc-300">
              Goal:{" "}
              {quest.goalType === "kill_enemies"
                ? `Defeat ${quest.targetCount} enemies`
                : `Open ${quest.targetCount} chests`}{" "}
              • Reward: {quest.rewardGold}g, {quest.rewardXp} XP
              {quest.rewardItem ? `, ${quest.rewardItem.itemName}` : ""}
            </p>

            {!isQuestCompleted && !activeQuest && (
              <button
                type="button"
                onClick={onAcceptQuest}
                className="w-full rounded-lg bg-amber-600 py-1.5 font-semibold text-white hover:bg-amber-500"
              >
                Accept Quest
              </button>
            )}

            {activeQuest && !isReady && (
              <div className="font-semibold text-amber-200">
                In Progress: {activeQuest.currentCount} / {activeQuest.targetCount}
              </div>
            )}

            {activeQuest && isReady && (
              <button
                type="button"
                onClick={() => onClaimQuest(quest.id)}
                className="w-full rounded-lg bg-emerald-600 py-1.5 font-semibold text-white hover:bg-emerald-500"
              >
                🎉 Claim Quest Reward
              </button>
            )}
          </div>
        )}

        {npc.role === "merchant" && (
          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase text-zinc-400">Merchant Wares</span>
              <span className="font-bold text-amber-300">Your Gold: {playerGold}g</span>
            </div>

            {npc.shopItems.length === 0 ? (
              <p className="text-xs text-zinc-500">Sold out!</p>
            ) : (
              <div className="space-y-1.5">
                {npc.shopItems.map((item) => {
                  const canAfford = playerGold >= item.goldCost;
                  const statLabel =
                    item.itemType === "potion"
                      ? `+${item.value} HP`
                      : item.itemType === "weapon"
                        ? `+${item.value} ATK`
                        : `+${item.value} DEF`;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-zinc-100">{item.itemName}</span>
                        <span className="ml-2 text-emerald-400">({statLabel})</span>
                      </div>
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuyItem(item.id)}
                        className="rounded-lg bg-amber-600 px-3 py-1 font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
                      >
                        Buy ({item.goldCost}g)
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
        >
          Continue Exploring
        </button>
      </div>
    </div>
  );
}
