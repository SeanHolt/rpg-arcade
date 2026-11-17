"use client";

import type { RpgBlueprint } from "@/lib/rpg/schema";
import { RpgPlayer } from "./RpgPlayer";

type TestPlayModalProps = {
  blueprint: RpgBlueprint;
  onClose: () => void;
};

export function TestPlayModal({ blueprint, onClose }: TestPlayModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/90 p-4 backdrop-blur-sm sm:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-amber-700/50 bg-amber-950/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-200">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              Test Mode
            </span>
            <span>Previewing unsaved blueprint. Progress is not recorded.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
          >
            ✕ Exit Test Mode
          </button>
        </div>

        <RpgPlayer blueprint={blueprint} authorName="You (Preview)" />
      </div>
    </div>
  );
}
