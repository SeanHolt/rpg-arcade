"use client";

import { RETRO_PALETTES } from "@/lib/rpg/pixel-palettes";

export type PixelTool = "pencil" | "fill" | "eyedropper" | "eraser";

type Props = {
  tool: PixelTool;
  setTool: (t: PixelTool) => void;
  color: string;
  setColor: (c: string) => void;
  paletteId: string;
  setPaletteId: (id: string) => void;
  mirrorX: boolean;
  setMirrorX: (v: boolean) => void;
  mirrorY: boolean;
  setMirrorY: (v: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onRotate: () => void;
  onClear: () => void;
};

export function PixelToolbar(p: Props) {
  const activePalette =
    RETRO_PALETTES.find((pal) => pal.id === p.paletteId) ?? RETRO_PALETTES[0];

  return (
    <div className="space-y-2.5 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            ["pencil", "✏️ Draw"],
            ["fill", "🪣 Fill"],
            ["eyedropper", "💧 Pick"],
            ["eraser", "🧹 Erase"],
          ] as [PixelTool, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => p.setTool(id)}
            className={`rounded-lg px-2.5 py-1.5 font-semibold ${
              p.tool === id
                ? "bg-emerald-600 text-white"
                : "border border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          disabled={!p.canUndo}
          onClick={p.onUndo}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
        >
          ↩ Undo
        </button>
        <button
          type="button"
          disabled={!p.canRedo}
          onClick={p.onRedo}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
        >
          ↪ Redo
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => p.setMirrorX(!p.mirrorX)}
          className={`rounded-lg border px-2.5 py-1 ${
            p.mirrorX
              ? "border-amber-500 bg-amber-950/60 text-amber-200"
              : "border-zinc-700 bg-zinc-950 text-zinc-400"
          }`}
        >
          ↔ Mirror X
        </button>
        <button
          type="button"
          onClick={() => p.setMirrorY(!p.mirrorY)}
          className={`rounded-lg border px-2.5 py-1 ${
            p.mirrorY
              ? "border-amber-500 bg-amber-950/60 text-amber-200"
              : "border-zinc-700 bg-zinc-950 text-zinc-400"
          }`}
        >
          ↕ Mirror Y
        </button>
        <button
          type="button"
          onClick={p.onFlipH}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
        >
          Flip H
        </button>
        <button
          type="button"
          onClick={p.onFlipV}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
        >
          Flip V
        </button>
        <button
          type="button"
          onClick={p.onRotate}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
        >
          ↻ 90°
        </button>
        <button
          type="button"
          onClick={p.onClear}
          className="rounded-lg border border-red-900/60 bg-zinc-950 px-2 py-1 text-red-400 hover:bg-red-950/40"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-2.5">
        <input
          type="color"
          value={p.color}
          onChange={(e) => {
            p.setColor(e.target.value);
            if (p.tool === "eraser" || p.tool === "eyedropper") p.setTool("pencil");
          }}
          className="h-7 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
        />
        <select
          value={p.paletteId}
          onChange={(e) => p.setPaletteId(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200"
        >
          {RETRO_PALETTES.map((pal) => (
            <option key={pal.id} value={pal.id}>
              {pal.label}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1">
          {activePalette.colors.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => {
                p.setColor(hex);
                if (p.tool === "eraser" || p.tool === "eyedropper") p.setTool("pencil");
              }}
              style={{ backgroundColor: hex }}
              className={`h-6 w-6 rounded border ${
                p.color.toLowerCase() === hex.toLowerCase()
                  ? "scale-110 border-white ring-1 ring-emerald-400"
                  : "border-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
