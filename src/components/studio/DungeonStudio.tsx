"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveGameBlueprint } from "@/actions/creator";
import { RpgBlueprintSchema, type RpgBlueprint } from "@/lib/rpg/schema";
import { DUNGEON_THEMES, type ThemeId } from "@/lib/rpg/themes";
import { useEditorStore } from "@/store/useEditorStore";
import { TestPlayModal } from "@/components/game/TestPlayModal";
import { OwnedPacksBar, type OwnedPackOption } from "./OwnedPacksBar";
import { ClassBuilderPanel } from "./ClassBuilderPanel";
import { StudioGrid } from "./StudioGrid";
import { StudioInspector } from "./StudioInspector";

type StudioProps = {
  gameId?: string;
  initialBlueprint?: RpgBlueprint;
  initialIsPublic?: boolean;
  ownedPacks?: OwnedPackOption[];
};

export function DungeonStudio({
  gameId,
  initialBlueprint,
  initialIsPublic = true,
  ownedPacks = [],
}: StudioProps) {
  const router = useRouter();
  const { blueprint, activeFloorId, loadBlueprint, updateMeta, setActiveFloor, addFloor } =
    useEditorStore();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [testData, setTestData] = useState<RpgBlueprint | null>(null);

  useEffect(() => {
    loadBlueprint(initialBlueprint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const validate = (): RpgBlueprint | null => {
    const res = RpgBlueprintSchema.safeParse(blueprint);
    if (!res.success) {
      setErrors(res.error.issues.map((i) => i.message));
      return null;
    }
    setErrors([]);
    return res.data;
  };

  const handleSave = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    const res = await saveGameBlueprint({
      gameId,
      rawJson: JSON.stringify(valid),
      isPublic,
    });
    setIsSaving(false);
    if (res.error) {
      setErrors([res.error, ...(res.issues ?? [])]);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      {testData && <TestPlayModal blueprint={testData} onClose={() => setTestData(null)} />}

      {errors.length > 0 && (
        <div className="rounded-xl border border-red-800 bg-red-950/70 p-4 text-xs text-red-200">
          {errors.map((err, i) => (
            <p key={i}>• {err}</p>
          ))}
        </div>
      )}

      <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 md:grid-cols-4">
        <div>
          <label className="text-xs text-zinc-400">Title</label>
          <input
            value={blueprint.title}
            onChange={(e) => updateMeta({ title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400">Difficulty</label>
          <select
            value={blueprint.difficulty}
            onChange={(e) =>
              updateMeta({ difficulty: e.target.value as "Easy" | "Normal" | "Hard" })
            }
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
          >
            <option value="Easy">Easy</option>
            <option value="Normal">Normal</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-400">Visual Theme</label>
          <select
            value={blueprint.theme ?? "crypt"}
            onChange={(e) => updateMeta({ theme: e.target.value as ThemeId })}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
          >
            {Object.values(DUNGEON_THEMES).map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-end gap-1.5">
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Public in Arcade
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={Boolean(blueprint.fogOfWar)}
              onChange={(e) => updateMeta({ fogOfWar: e.target.checked })}
            />
            Fog of War
          </label>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const valid = validate();
                if (valid) setTestData(valid);
              }}
              className="flex-1 rounded-lg border border-amber-700 bg-amber-950/60 py-1.5 text-xs font-semibold text-amber-200"
            >
              ▶ Test
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white"
            >
              {isSaving ? "..." : "Save"}
            </button>
          </div>
        </div>
        <div className="md:col-span-4">
          <input
            value={blueprint.description}
            onChange={(e) => updateMeta({ description: e.target.value })}
            placeholder="Dungeon description..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <OwnedPacksBar packs={ownedPacks} />

      <ClassBuilderPanel />

      <div className="flex flex-wrap gap-2">
        {blueprint.floors.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFloor(f.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              f.id === activeFloorId
                ? "bg-emerald-600 text-white"
                : "border border-zinc-800 bg-zinc-900 text-zinc-400"
            }`}
          >
            {f.name}
          </button>
        ))}
        <button
          type="button"
          onClick={addFloor}
          className="rounded-lg border border-dashed border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
        >
          + Add Floor
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <StudioGrid />
        <StudioInspector />
      </div>
    </div>
  );
}
