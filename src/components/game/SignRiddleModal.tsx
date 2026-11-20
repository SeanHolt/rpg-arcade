"use client";

import type { RpgSign } from "@/lib/rpg/schema";

type Props = {
  sign: RpgSign;
  isSolved: boolean;
  onAnswer: (optionIndex: number) => void;
  onClose: () => void;
};

export function SignRiddleModal({ sign, isSolved, onAnswer, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-amber-700/60 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-amber-200">📜 {sign.title}</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-200">
          {sign.message}
        </p>

        {sign.riddle && (
          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300">🧩 Ancient Riddle</span>
              <span className="text-amber-300">
                Reward: +{sign.riddle.rewardGold}g / +{sign.riddle.rewardXp} XP
              </span>
            </div>

            <p className="text-xs font-medium text-zinc-300">{sign.riddle.question}</p>

            {isSolved ? (
              <div className="rounded-lg border border-emerald-700 bg-emerald-950/60 p-2.5 text-center text-xs font-semibold text-emerald-200">
                ✓ Riddle Solved! Reward Claimed.
              </div>
            ) : (
              <div className="grid gap-1.5 pt-1">
                {sign.riddle.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onAnswer(idx)}
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-xs text-zinc-200 hover:border-emerald-500 hover:bg-zinc-800"
                  >
                    {idx + 1}. {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
