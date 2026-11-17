import type { ActiveQuestProgress } from "./runtime-types";

export function incrementQuestProgress(
  quests: ActiveQuestProgress[],
  goalType: "kill_enemies" | "open_chests"
): { updatedQuests: ActiveQuestProgress[]; readyMessages: string[] } {
  const readyMessages: string[] = [];

  const updatedQuests = quests.map((q) => {
    if (q.goalType !== goalType || q.currentCount >= q.targetCount) return q;
    const nextCount = Math.min(q.targetCount, q.currentCount + 1);
    if (nextCount === q.targetCount) {
      readyMessages.push(`📜 Quest Ready: "${q.title}" — Return to ${q.npcName} to claim your reward!`);
    }
    return { ...q, currentCount: nextCount };
  });

  return { updatedQuests, readyMessages };
}
