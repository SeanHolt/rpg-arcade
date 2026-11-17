"use client";

import { useState, useTransition } from "react";
import { publishAssetPack } from "@/actions/marketplace";
import type { PackSpritesPayload } from "@/lib/rpg/pack-schema";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";
import { PixelArtModal } from "@/components/studio/PixelArtModal";

type TileKey = "wall" | "floor" | "stairs" | "shrine" | "chest";

export function CreatePackModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(50);
  const [tiles, setTiles] = useState<PackSpritesPayload["tiles"]>({});
  const [entities, setEntities] = useState<PackSpritesPayload["entities"]>([]);
  const [newEntityLabel, setNewEntityLabel] = useState("Custom Monster");

  const [drawTile, setDrawTile] = useState<TileKey | null>(null);
  const [drawEntity, setDrawEntity] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await publishAssetPack({
        title,
        description,
        price,
        sprites: { tiles, entities },
      });
      if (res.error) setError(res.error);
      else onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      {drawTile && (
        <PixelArtModal
          title={`Pack Tile: ${drawTile}`}
          onSave={(url) => setTiles((prev) => ({ ...prev, [drawTile]: url }))}
          onClose={() => setDrawTile(null)}
        />
      )}

      {drawEntity && (
        <PixelArtModal
          title={`Sprite: ${newEntityLabel}`}
          onSave={(url) => {
            setEntities((prev) => [
              ...prev,
              { label: newEntityLabel.trim() || "Sprite", sprite: url },
            ]);
            setNewEntityLabel("Custom Monster");
          }}
          onClose={() => setDrawEntity(false)}
        />
      )}

      <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Publish Asset Pack</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        {error && (
          <p className="rounded-lg border border-red-800 bg-red-950/70 p-3 text-xs text-red-200">
            {error}
          </p>
        )}

        <form onSubmit={handlePublish} className="space-y-4 text-xs">
          <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
            <label>
              Pack Title
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Neon Cyber Tileset"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </label>
            <label>
              Price (0 = Free)
              <input
                type="number"
                min={0}
                max={5000}
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="block">
            Description
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Includes custom walls, chests, and boss sprites."
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </label>

          <div>
            <div className="mb-1.5 font-semibold text-zinc-300">1. Tile Overrides</div>
            <div className="grid grid-cols-5 gap-2">
              {(["wall", "floor", "stairs", "shrine", "chest"] as TileKey[]).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setDrawTile(slot)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-2 hover:border-emerald-600"
                >
                  {tiles[slot] ? (
                    <SpriteDisplay sprite={tiles[slot]!} sizeClass="h-6 w-6" />
                  ) : (
                    <span className="text-base">🎨</span>
                  )}
                  <span className="capitalize text-zinc-400">{slot}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 font-semibold text-zinc-300">
              2. Character / Monster Sprites ({entities.length}/8)
            </div>
            <div className="flex gap-2">
              <input
                value={newEntityLabel}
                onChange={(e) => setNewEntityLabel(e.target.value)}
                placeholder="Sprite Label (e.g. Cyber Dragon)"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5"
              />
              <button
                type="button"
                disabled={entities.length >= 8}
                onClick={() => setDrawEntity(true)}
                className="rounded-lg border border-emerald-700 bg-emerald-950/60 px-3 py-1.5 font-semibold text-emerald-300 disabled:opacity-40"
              >
                + Draw / Upload
              </button>
            </div>

            {entities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {entities.map((ent, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1"
                  >
                    <SpriteDisplay sprite={ent.sprite} sizeClass="h-5 w-5" />
                    <span>{ent.label}</span>
                    <button
                      type="button"
                      onClick={() => setEntities((p) => p.filter((_, i) => i !== idx))}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isPending ? "Publishing..." : "Publish to Marketplace"}
          </button>
        </form>
      </div>
    </div>
  );
}
