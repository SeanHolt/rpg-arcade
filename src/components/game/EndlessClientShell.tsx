"use client";

import { startTransition, useEffect, useState } from "react";
import { createEndlessBlueprint } from "@/lib/rpg/endless-generator";
import type { RpgBlueprint } from "@/lib/rpg/schema";
import { RpgPlayer } from "./RpgPlayer";
import { ENDLESS_SAVE_KEY, type SavedRunData } from "./SaveRunControls";

type Props = {
  isLoggedIn: boolean;
  cloudSave?: SavedRunData;
};

export function EndlessClientShell({ isLoggedIn, cloudSave }: Props) {
  const [blueprint, setBlueprint] = useState<RpgBlueprint | null>(null);
  const [savedRun, setSavedRun] = useState<SavedRunData | undefined>(cloudSave);

  useEffect(() => {
    startTransition(() => {
      setBlueprint(createEndlessBlueprint());
      if (!isLoggedIn) {
        const raw = localStorage.getItem(ENDLESS_SAVE_KEY);
        if (raw) {
          try {
            setSavedRun(JSON.parse(raw));
          } catch {
            localStorage.removeItem(ENDLESS_SAVE_KEY);
          }
        }
      }
    });
  }, [isLoggedIn]);

  if (!blueprint) {
    return <div className="h-96 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />;
  }

  return (
    <RpgPlayer
      blueprint={blueprint}
      authorName="Procedural Dungeon Engine"
      isEndless
      isLoggedIn={isLoggedIn}
      savedRun={savedRun}
    />
  );
}
