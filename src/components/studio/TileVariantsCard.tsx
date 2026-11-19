"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";
import { PixelArtModal } from "./PixelArtModal";

const PROP_PRESETS = ["🔥", "🕯️", "💀", "📚", "💎", "🪴", "🪑", "Banner"];

export function TileVariantsCard() {
  const {
    blueprint,
    activeTool,
    setActiveTool,
    activeVariantIndex,
    setActiveVariantIndex,
    activePropSprite,
    setActivePropSprite,
    setTileVariantSprite,
  } = useEditorStore();

  const [drawTarget, setDrawTarget] = useState<
    { kind: "wall" | "floor"; idx: number } | { kind: "prop" } | null
  >(null);

  const cs = blueprint.customSprites ?? {};
  const wallSlots = [cs.wall, cs.wallVariants?.[0], cs.wallVariants?.[1], cs.wallVariants?.[2]];
  const floorSlots = [cs.floor, cs.floorVariants?.[0], cs.floorVariants?.[1], cs.floorVariants?.[2]];

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
      {drawTarget && (
        <PixelArtModal
          title={
            drawTarget.kind === "prop"
              ? "Decorative Prop Sprite"
              : `${drawTarget.kind.toUpperCase()} Variant #${drawTarget.idx + 1}`
          }
          onSave={(url) => {
            if (drawTarget.kind === "prop") setActivePropSprite(url);
            else setTileVariantSprite(drawTarget.kind, drawTarget.idx, url);
          }}
          onClose={() => setDrawTarget(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <span className="font-semibold uppercase text-zinc-300">
          🧱 Tile Variants &amp; Props
        </span>
        <span className="text-[11px] text-zinc-500">Click slot to paint</span>
      </div>

      {/* 4 Wall Variants */}
      <div>
        <div className="mb-1 text-zinc-400">Wall Variants (1–4)</div>
        <div className="grid grid-cols-4 gap-1.5">
          {wallSlots.map((sprite, idx) => {
            const isSelected = activeTool === "wall" && activeVariantIndex === idx;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/40"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool("wall");
                    setActiveVariantIndex(idx);
                  }}
                  className="flex h-7 w-7 items-center justify-center"
                >
                  {sprite ? (
                    <SpriteDisplay sprite={sprite} sizeClass="h-6 w-6" />
                  ) : (
                    <span className="font-mono text-zinc-500">#{idx + 1}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawTarget({ kind: "wall", idx })}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  🎨 Draw
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Floor Variants */}
      <div>
        <div className="mb-1 text-zinc-400">Floor Variants (1–4)</div>
        <div className="grid grid-cols-4 gap-1.5">
          {floorSlots.map((sprite, idx) => {
            const isSelected = activeTool === "floor" && activeVariantIndex === idx;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/40"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool("floor");
                    setActiveVariantIndex(idx);
                  }}
                  className="flex h-7 w-7 items-center justify-center"
                >
                  {sprite ? (
                    <SpriteDisplay sprite={sprite} sizeClass="h-6 w-6" />
                  ) : (
                    <span className="font-mono text-zinc-500">#{idx + 1}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawTarget({ kind: "floor", idx })}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  🎨 Draw
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative Props Layer */}
      <div className="space-y-1.5 border-t border-zinc-800 pt-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTool("prop")}
            className={`rounded-lg px-2.5 py-1 font-semibold ${
              activeTool === "prop"
                ? "bg-emerald-600 text-white"
                : "border border-zinc-700 bg-zinc-950 text-zinc-300"
            }`}
          >
            🪴 Stamp Prop Brush
          </button>
          <button
            type="button"
            onClick={() => setDrawTarget({ kind: "prop" })}
            className="text-emerald-400 hover:underline"
          >
            🎨 Custom Prop
          </button>
        </div>

        <div className="flex flex-wrap gap-1 pt-1">
          {PROP_PRESETS.slice(0, 7).map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => {
                setActivePropSprite(icon);
                setActiveTool("prop");
              }}
              className={`rounded border px-2 py-1 text-sm ${
                activePropSprite === icon && activeTool === "prop"
                  ? "border-emerald-500 bg-emerald-950/60"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
