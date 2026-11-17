"use client";

import type { ActiveQuestProgress } from "@/lib/rpg/runtime-types";

export function QuestTrackerCard({ quests }: { quests: ActiveQuestProgress[] }) {
  if (quests.length === 0) return null;

  return (
    <div className="space-y-2 rounded-xl border border-amber-800/50 bg-zinc-900/80 p-4 text-xs">
      <h3 className="font-semibold uppercase tracking-wider text-amber-300">
        Active Quests ({quests.length})
      </h3>

      <div className="space-y-2">
        {quests.map((q) => {
          const isReady = q.currentCount >= q.targetCount;
          const goalLabel =
            q.goalType === "kill_enemies" ? "Defeat Enemies" : "Open Chests";

          return (
            <div
              key={q.questId}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5"
            >
              <div className="flex items-center justify-between font-semibold text-zinc-100">
                <span>📜 {q.title}</span>
                <span className={isReady ? "text-emerald-400" : "text-amber-300"}>
                  {q.currentCount}/{q.targetCount}
                </span>
              </div>
              <div className="mt-1 text-zinc-400">
                {goalLabel} • From {q.npcName}
              </div>
              {isReady && (
                <div className="mt-1 font-semibold text-emerald-400">
                  ✓ Return to {q.npcName} to claim reward!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
