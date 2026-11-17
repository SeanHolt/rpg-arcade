"use client";

import { useState, useTransition } from "react";
import {
  clearEndlessProgress,
  clearMidRunProgress,
  saveEndlessProgress,
  saveMidRunProgress,
} from "@/actions/saves";
import type { SerializedRunSnapshot } from "@/lib/rpg/runtime-types";

export const ENDLESS_SAVE_KEY = "rpg-arcade-endless-save";

export type SavedRunData = {
  floorName: string;
  heroLevel: number;
  updatedAtLabel: string;
  snapshot: SerializedRunSnapshot;
};

type ResumeBannerProps = {
  gameId?: string;
  isEndless?: boolean;
  isLoggedIn?: boolean;
  savedRun: SavedRunData;
  onResume: (snapshot: SerializedRunSnapshot) => void;
};

export function ResumeSaveBanner({
  gameId,
  isEndless,
  isLoggedIn,
  savedRun,
  onResume,
}: ResumeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  const handleDelete = () => {
    if (isEndless) {
      if (!isLoggedIn) {
        localStorage.removeItem(ENDLESS_SAVE_KEY);
        setDismissed(true);
        return;
      }
      startTransition(async () => {
        await clearEndlessProgress();
        setDismissed(true);
      });
      return;
    }

    if (!gameId) return;
    startTransition(async () => {
      await clearMidRunProgress(gameId);
      setDismissed(true);
    });
  };

  return (
    <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-700/60 bg-emerald-950/40 p-5">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          {isEndless && isLoggedIn ? "Cloud Save Found" : "Saved Progress Found"}
        </div>
        <p className="mt-1 text-sm text-zinc-200">
          <span className="font-semibold">{savedRun.snapshot.player.name}</span> (Lv.{" "}
          {savedRun.heroLevel}) on <span className="font-semibold">{savedRun.floorName}</span>
        </p>
        <p className="text-xs text-zinc-400">Last saved: {savedRun.updatedAtLabel}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onResume(savedRun.snapshot)}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
        >
          ▶ Resume Run
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-400 hover:text-red-400"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

type SaveButtonProps = {
  gameId?: string;
  isEndless?: boolean;
  isLoggedIn?: boolean;
  floorName: string;
  getSnapshot: () => SerializedRunSnapshot;
};

export function SaveProgressButton({
  gameId,
  isEndless,
  isLoggedIn,
  floorName,
  getSnapshot,
}: SaveButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setFeedback(null);
    const snapshot = getSnapshot();

    if (isEndless) {
      if (!isLoggedIn) {
        const payload: SavedRunData = {
          floorName,
          heroLevel: snapshot.player.level,
          updatedAtLabel: new Date().toLocaleString(),
          snapshot,
        };
        localStorage.setItem(ENDLESS_SAVE_KEY, JSON.stringify(payload));
        setFeedback("Saved locally!");
        return;
      }

      startTransition(async () => {
        const res = await saveEndlessProgress({
          floorName,
          depth: snapshot.endlessDepth ?? 1,
          snapshot,
        });
        if (res.error) setFeedback(res.error);
        else setFeedback("Saved to Cloud!");
      });
      return;
    }

    if (!gameId) return;
    startTransition(async () => {
      const res = await saveMidRunProgress({
        gameId,
        floorName,
        snapshot,
      });
      if (res.error) setFeedback(res.error);
      else setFeedback("Saved!");
    });
  };

  return (
    <div className="flex items-center gap-2">
      {feedback && <span className="text-xs text-emerald-400">{feedback}</span>}
      <button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className="rounded-lg border border-emerald-700 bg-emerald-950/60 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 disabled:opacity-50"
      >
        {isPending ? "Saving..." : isEndless && isLoggedIn ? "☁️ Save Run" : "💾 Save Run"}
      </button>
    </div>
  );
}
