"use client";

import { useState, useTransition } from "react";
import { unlockAssetPack } from "@/actions/marketplace";
import type { PackSpritesPayload } from "@/lib/rpg/pack-schema";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";
import { CreatePackModal } from "./CreatePackModal";

export type MarketplacePackItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  authorName: string;
  isOwned: boolean;
  sprites: PackSpritesPayload;
};

type Props = {
  isLoggedIn: boolean;
  userCoins: number;
  packs: MarketplacePackItem[];
};

export function MarketplaceFeed({ isLoggedIn, userCoins, packs }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUnlock = (packId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await unlockAssetPack(packId);
      if (res.error) setError(res.error);
    });
  };

  return (
    <div className="space-y-6">
      {showCreate && <CreatePackModal onClose={() => setShowCreate(false)} />}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Creator Asset Marketplace</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Unlock community pixel-art tile & sprite packs to use in your Visual Studio dungeons.
          </p>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-700/50 bg-amber-950/50 px-3.5 py-2 text-xs font-bold text-amber-300">
              🪙 {userCoins} Coins
            </div>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              + Create & Sell Pack
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-800 bg-red-950/70 p-3 text-xs text-red-200">
          {error}
        </p>
      )}

      {packs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center text-sm text-zinc-400">
          No asset packs published yet. Click &ldquo;+ Create &amp; Sell Pack&rdquo; to publish the first one!
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => {
            const tileList = Object.entries(pack.sprites.tiles).filter(([, v]) => Boolean(v));
            return (
              <article
                key={pack.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-zinc-100">{pack.title}</h2>
                    <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                      {pack.price === 0 ? "FREE" : `🪙 ${pack.price}`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">By {pack.authorName}</p>
                  <p className="mt-2 text-xs text-zinc-300">{pack.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2 rounded-lg bg-zinc-950 p-2.5">
                    {tileList.map(([key, url]) => (
                      <div key={key} title={`Tile: ${key}`} className="rounded bg-zinc-900 p-1">
                        <SpriteDisplay sprite={url!} sizeClass="h-6 w-6" />
                      </div>
                    ))}
                    {pack.sprites.entities.map((ent, i) => (
                      <div key={i} title={ent.label} className="rounded bg-zinc-900 p-1">
                        <SpriteDisplay sprite={ent.sprite} sizeClass="h-6 w-6" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-800 pt-3">
                  {pack.isOwned ? (
                    <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/40 py-2 text-center text-xs font-semibold text-emerald-300">
                      ✓ Unlocked in Studio
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!isLoggedIn || isPending}
                      onClick={() => handleUnlock(pack.id)}
                      className="w-full rounded-lg bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
                    >
                      {!isLoggedIn
                        ? "Log in to Unlock"
                        : pack.price === 0
                          ? "Unlock Free Pack"
                          : `Buy for ${pack.price} Coins`}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
