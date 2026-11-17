"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { PixelArtModal } from "./PixelArtModal";
import { ClassCardEditor } from "./ClassCardEditor";

export function ClassBuilderPanel() {
  const {
    blueprint,
    addHeroClass,
    updateHeroClass,
    removeHeroClass,
    setClassStarterItems,
  } = useEditorStore();

  const [drawingClassId, setDrawingClassId] = useState<string | null>(null);
  const classes = blueprint.classes ?? [];
  const activeClass = classes.find((c) => c.id === drawingClassId);

  return (
    <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
      {activeClass && (
        <PixelArtModal
          title={`Class: ${activeClass.name}`}
          onSave={(dataUrl) => updateHeroClass(activeClass.id, { sprite: dataUrl })}
          onClose={() => setDrawingClassId(null)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
            Playable Hero Classes ({classes.length}/6)
          </h2>
          <p className="text-xs text-zinc-400">
            Define classes players can pick before entering (leave empty for default hero).
          </p>
        </div>

        <button
          type="button"
          disabled={classes.length >= 6}
          onClick={addHeroClass}
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
              onDrawSprite={() => setDrawingClassId(cls.id)}
              onUpdate={(fields) => updateHeroClass(cls.id, fields)}
              onRemove={() => removeHeroClass(cls.id)}
              onSetItems={(items) => setClassStarterItems(cls.id, items)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
