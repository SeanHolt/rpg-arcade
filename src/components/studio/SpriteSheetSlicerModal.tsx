"use client";

import { useState } from "react";
import { sliceImageToSprites } from "@/lib/rpg/sheet-slicer";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";

type TargetSlot =
  | "wall"
  | "floor"
  | "stairs"
  | "shrine"
  | "shrineFrame2"
  | "chest"
  | "selectedEntity"
  | "selectedEntityFrame2";

type Props = {
  hasSelectedEntity: boolean;
  onAssignTile: (slot: "wall" | "floor" | "stairs" | "shrine" | "shrineFrame2" | "chest", url: string) => void;
  onAssignEntity: (url: string, isFrame2: boolean) => void;
  onClose: () => void;
};

export function SpriteSheetSlicerModal({
  hasSelectedEntity,
  onAssignTile,
  onAssignEntity,
  onClose,
}: Props) {
  const [cellSize, setCellSize] = useState<16 | 32>(16);
  const [slices, setSlices] = useState<string[]>([]);
  const [target, setTarget] = useState<TargetSlot>("wall");
  const [appliedNote, setAppliedNote] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setSlices(sliceImageToSprites(img, cellSize, 32));
      setAppliedNote(null);
    };
    img.src = URL.createObjectURL(file);
  };

  const applySprite = (url: string) => {
    if (target === "selectedEntity" || target === "selectedEntityFrame2") {
      onAssignEntity(url, target === "selectedEntityFrame2");
      setAppliedNote(`Applied to Selected Entity (${target === "selectedEntityFrame2" ? "Frame 2" : "Frame 1"})!`);
    } else {
      onAssignTile(target, url);
      setAppliedNote(`Applied to ${target} sprite!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg space-y-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-5 text-xs shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-100">✂️ PNG Sprite Sheet Slicer</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={cellSize}
            onChange={(e) => setCellSize(Number(e.target.value) as 16 | 32)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-zinc-200"
          >
            <option value={16}>16×16 Grid Cells</option>
            <option value={32}>32×32 Grid Cells</option>
          </select>

          <label className="cursor-pointer rounded-lg bg-emerald-600 px-3.5 py-2 font-semibold text-white hover:bg-emerald-500">
            📁 Choose Sprite Sheet PNG
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        </div>

        <label className="block text-zinc-300">
          Click any sliced sprite below to assign it to:
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as TargetSlot)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5"
          >
            <option value="wall">Wall Tile</option>
            <option value="floor">Floor Tile</option>
            <option value="stairs">Stairway Tile</option>
            <option value="shrine">Shrine Tile (Frame 1)</option>
            <option value="shrineFrame2">Shrine Tile (🎬 Frame 2)</option>
            <option value="chest">Chest Tile</option>
            {hasSelectedEntity && (
              <>
                <option value="selectedEntity">Selected Monster / NPC (Frame 1)</option>
                <option value="selectedEntityFrame2">Selected Monster / NPC (🎬 Frame 2)</option>
              </>
            )}
          </select>
        </label>

        {appliedNote && (
          <p className="rounded-lg border border-emerald-700 bg-emerald-950/60 px-3 py-1.5 text-emerald-200">
            ✓ {appliedNote}
          </p>
        )}

        {slices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
            Upload a PNG sprite sheet to automatically slice out non-empty 16×16 tiles.
          </div>
        ) : (
          <div className="grid max-h-56 grid-cols-8 gap-2 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            {slices.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applySprite(url)}
                title={`Slice #${idx + 1}`}
                className="flex items-center justify-center rounded border border-zinc-800 bg-zinc-900 p-1.5 hover:border-emerald-500"
              >
                <SpriteDisplay sprite={url} sizeClass="h-6 w-6" />
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end border-t border-zinc-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-2 font-semibold text-zinc-200 hover:bg-zinc-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
