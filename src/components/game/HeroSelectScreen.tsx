"use client";

import { useState } from "react";
import type { RpgBlueprint } from "@/lib/rpg/schema";
import { SpriteDisplay } from "./SpriteDisplay";

type Props = {
  blueprint: RpgBlueprint;
  authorName: string;
  onStart: (classId?: string, customName?: string) => void;
};

export function HeroSelectScreen({ blueprint, authorName, onStart }: Props) {
  const classes = blueprint.classes ?? [];
  const [selectedId, setSelectedId] = useState<string | undefined>(classes.at(0)?.id);
  const [heroName, setHeroName] = useState<string>("");

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-100">{blueprint.title}</h1>
          <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
            {blueprint.difficulty}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          By {authorName} • {blueprint.description}
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          1. Enter Your Hero&apos;s Name (Optional)
        </label>
        <input
          type="text"
          maxLength={24}
          value={heroName}
          onChange={(e) => setHeroName(e.target.value)}
          placeholder={`Default: ${blueprint.player.name}`}
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none sm:max-w-sm"
        />
      </div>

      {classes.length > 0 && (
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            2. Choose Your Class
          </span>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {classes.map((cls) => {
              const active = cls.id === selectedId;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedId(cls.id)}
                  className={`flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-emerald-500 bg-emerald-950/40"
                      : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <SpriteDisplay sprite={cls.sprite} />
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs uppercase text-zinc-300">
                        {cls.combatType === "ranged" ? `Ranged (${cls.range})` : "Melee"}
                      </span>
                    </div>
                    <h3 className="mt-2 font-bold text-zinc-100">{cls.name}</h3>
                    {cls.description && (
                      <p className="mt-1 text-xs text-zinc-400">{cls.description}</p>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 border-t border-zinc-800 pt-3 text-xs">
                    <div className="flex justify-between font-mono text-zinc-300">
                      <span>HP {cls.maxHp}</span>
                      <span>ATK {cls.atk}</span>
                      <span>DEF {cls.def}</span>
                    </div>
                    {cls.starterItems.length > 0 && (
                      <div className="text-emerald-300">
                        Starts with: {cls.starterItems.map((i) => i.itemName).join(", ")}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onStart(selectedId, heroName)}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        ⚔️ Enter Dungeon
      </button>
    </div>
  );
}
