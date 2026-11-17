"use client";

import type { PackSpritesPayload } from "@/lib/rpg/pack-schema";
import { useEditorStore } from "@/store/useEditorStore";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";

export type OwnedPackOption = {
  id: string;
  title: string;
  sprites: PackSpritesPayload;
};

export function OwnedPacksBar({ packs }: { packs: OwnedPackOption[] }) {
  const { updateMeta, selectedEnemyId, updateEnemy } = useEditorStore();

  if (packs.length === 0) return null;

  return (
    <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 text-xs">
      <div className="font-semibold uppercase tracking-wider text-zinc-400">
        Your Unlocked Asset Packs ({packs.length})
      </div>
      <div className="flex flex-wrap gap-3">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          >
            <span className="font-semibold text-zinc-200">{pack.title}</span>

            {Object.values(pack.sprites.tiles).some(Boolean) && (
              <button
                type="button"
                onClick={() => updateMeta({ customSprites: pack.sprites.tiles })}
                className="rounded bg-emerald-950/70 px-2 py-1 text-emerald-300 hover:bg-emerald-900/60"
              >
                Apply Tiles
              </button>
            )}

            {pack.sprites.entities.map((ent, idx) => (
              <button
                key={idx}
                type="button"
                title={
                  selectedEnemyId
                    ? `Apply "${ent.label}" to selected enemy`
                    : "Select an enemy on the grid first to apply sprite"
                }
                disabled={!selectedEnemyId}
                onClick={() => {
                  if (selectedEnemyId) updateEnemy(selectedEnemyId, { sprite: ent.sprite });
                }}
                className="rounded border border-zinc-800 bg-zinc-900 p-1 hover:border-amber-500 disabled:opacity-40"
              >
                <SpriteDisplay sprite={ent.sprite} sizeClass="h-5 w-5" />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
