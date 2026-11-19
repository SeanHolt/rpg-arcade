"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { ClassCardEditor } from "./ClassCardEditor";
import { PixelArtModal } from "./PixelArtModal";

export function ClassBuilderPanel({ maxClasses = 6 }: { maxClasses?: number }) {
  const {
    blueprint,
    addHeroClass,
    updateHeroClass,
    removeHeroClass,
    setClassStarterItems,
  } = useEditorStore();
  const [drawingState, setDrawingState] = useState<{ id: string; frame2: boolean } | null>(null);
  const classes = blueprint.classes ?? [];
  const activeDrawClass = classes.find((c) => c.id === drawingState?.id);

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
      {activeDrawClass && drawingState && (
        <PixelArtModal
          title={`Class: ${activeDrawClass.name} (${drawingState.frame2 ? "Frame 2" : "Frame 1"})`}
          initialSprite={
            drawingState.frame2 ? activeDrawClass.spriteFrame2 : activeDrawClass.sprite
          }
          onSave={(dataUrl) =>
            updateHeroClass(
              activeDrawClass.id,
              drawingState.frame2 ? { spriteFrame2: dataUrl } : { sprite: dataUrl }
            )
          }
          onClose={() => setDrawingState(null)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-zinc-100">
            Playable Hero Classes ({classes.length}/{maxClasses})
          </h2>
          <p className="text-xs text-zinc-400">
            Define melee or ranged classes with custom sprites, signature skills, and starter items.
          </p>
        </div>

        <button
          type="button"
          disabled={classes.length >= maxClasses}
          onClick={() => addHeroClass(maxClasses)}
          className="rounded-lg border border-emerald-700 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 disabled:opacity-40"
        >
          + Add Class
        </button>
      </div>

      {classes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((cls) => (
            <ClassCardEditor
              key={cls.id}
              cls={cls}
              onUpdate={(fields) => updateHeroClass(cls.id, fields)}
              onRemove={() => removeHeroClass(cls.id)}
              onSetItems={(items) => setClassStarterItems(cls.id, items)}
              onDrawSprite={() => setDrawingState({ id: cls.id, frame2: false })}
              onDrawFrame2={() => setDrawingState({ id: cls.id, frame2: true })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
