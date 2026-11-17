"use client";

import type { RpgBlueprint } from "@/lib/rpg/schema";
import { DUNGEON_THEMES, type ThemeId } from "@/lib/rpg/themes";

type Props = {
  blueprint: RpgBlueprint;
  onChange: (updated: RpgBlueprint) => void;
};

export function JsonMetaCard({ blueprint, onChange }: Props) {
  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 text-xs">
      <h2 className="font-bold uppercase tracking-wider text-zinc-300">
        1. Dungeon Info &amp; Theme
      </h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="sm:col-span-2">
          Title
          <input
            value={blueprint.title}
            onChange={(e) => onChange({ ...blueprint, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
          />
        </label>

        <label>
          Difficulty
          <select
            value={blueprint.difficulty}
            onChange={(e) =>
              onChange({
                ...blueprint,
                difficulty: e.target.value as "Easy" | "Normal" | "Hard",
              })
            }
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
          >
            <option value="Easy">Easy</option>
            <option value="Normal">Normal</option>
            <option value="Hard">Hard</option>
          </select>
        </label>
      </div>

      <label className="block">
        Description
        <input
          value={blueprint.description}
          onChange={(e) => onChange({ ...blueprint, description: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <label className="flex items-center gap-2">
          <span className="text-zinc-400">Theme:</span>
          <select
            value={blueprint.theme ?? "crypt"}
            onChange={(e) => onChange({ ...blueprint, theme: e.target.value as ThemeId })}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1"
          >
            {Object.values(DUNGEON_THEMES).map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-zinc-300">
          <input
            type="checkbox"
            checked={Boolean(blueprint.fogOfWar)}
            onChange={(e) => onChange({ ...blueprint, fogOfWar: e.target.checked })}
          />
          Enable Fog of War (Radius: {blueprint.visionRadius ?? 2})
        </label>
      </div>
    </div>
  );
}
