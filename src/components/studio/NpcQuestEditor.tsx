"use client";

import type { RpgNpcQuest } from "@/lib/rpg/schema";

type Props = {
  quest?: RpgNpcQuest;
  onChange: (quest?: RpgNpcQuest) => void;
};

export function NpcQuestEditor({ quest, onChange }: Props) {
  const enableQuest = () => {
    onChange({
      id: `quest-${Date.now().toString(36)}`,
      title: "Clear the Halls",
      goalType: "kill_enemies",
      targetCount: 2,
      rewardGold: 40,
      rewardXp: 50,
    });
  };

  if (!quest) {
    return (
      <div className="border-t border-zinc-800 pt-2">
        <button
          type="button"
          onClick={enableQuest}
          className="w-full rounded border border-amber-800/70 bg-amber-950/40 py-1.5 font-semibold text-amber-300 hover:bg-amber-900/50"
        >
          + Attach Side Quest to NPC
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 border-t border-zinc-800 pt-2">
      <div className="flex items-center justify-between font-semibold text-amber-300">
        <span>📜 NPC Side Quest</span>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-zinc-500 hover:text-red-400"
        >
          Remove
        </button>
      </div>

      <input
        value={quest.title}
        onChange={(e) => onChange({ ...quest, title: e.target.value })}
        placeholder="Quest Title"
        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
      />

      <div className="grid grid-cols-2 gap-1.5">
        <label>
          Goal
          <select
            value={quest.goalType}
            onChange={(e) =>
              onChange({
                ...quest,
                goalType: e.target.value as "kill_enemies" | "open_chests",
              })
            }
            className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1"
          >
            <option value="kill_enemies">Defeat Enemies</option>
            <option value="open_chests">Open Chests</option>
          </select>
        </label>
        <label>
          Target Count
          <input
            type="number"
            min={1}
            max={50}
            value={quest.targetCount}
            onChange={(e) =>
              onChange({ ...quest, targetCount: Math.max(1, Number(e.target.value) || 1) })
            }
            className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <label>
          Reward Gold
          <input
            type="number"
            min={0}
            value={quest.rewardGold}
            onChange={(e) =>
              onChange({ ...quest, rewardGold: Math.max(0, Number(e.target.value) || 0) })
            }
            className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        </label>
        <label>
          Reward XP
          <input
            type="number"
            min={0}
            value={quest.rewardXp}
            onChange={(e) =>
              onChange({ ...quest, rewardXp: Math.max(0, Number(e.target.value) || 0) })
            }
            className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        </label>
      </div>
    </div>
  );
}
