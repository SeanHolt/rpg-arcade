"use client";

import type { RpgBlueprint } from "@/lib/rpg/schema";

type Props = {
  blueprint: RpgBlueprint;
  onChange: (updated: RpgBlueprint) => void;
};

export function JsonHeroCard({ blueprint, onChange }: Props) {
  const p = blueprint.player;
  const updatePlayer = (fields: Partial<RpgBlueprint["player"]>) =>
    onChange({ ...blueprint, player: { ...p, ...fields } });

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 text-xs">
      <h2 className="font-bold uppercase tracking-wider text-zinc-300">
        2. Default Hero &amp; Spawn Point
      </h2>

      <div className="grid gap-3 sm:grid-cols-4">
        <label>
          Icon
          <input
            value={p.sprite}
            maxLength={8}
            onChange={(e) => updatePlayer({ sprite: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-center text-base"
          />
        </label>

        <label className="sm:col-span-2">
          Hero Name
          <input
            value={p.name}
            onChange={(e) => updatePlayer({ name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
          />
        </label>

        <label>
          Start Floor
          <select
            value={p.startFloorId}
            onChange={(e) => updatePlayer({ startFloorId: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5"
          >
            {blueprint.floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <label>
          Spawn X
          <input
            type="number"
            min={1}
            value={p.startX}
            onChange={(e) => updatePlayer({ startX: Number(e.target.value) || 1 })}
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        </label>
        <label>
          Spawn Y
          <input
            type="number"
            min={1}
            value={p.startY}
            onChange={(e) => updatePlayer({ startY: Number(e.target.value) || 1 })}
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        </label>
        <label>
          Max HP
          <input
            type="number"
            min={10}
            value={p.maxHp}
            onChange={(e) => updatePlayer({ maxHp: Number(e.target.value) || 10 })}
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        </label>
        <label>
          ATK
          <input
            type="number"
            min={1}
            value={p.atk}
            onChange={(e) => updatePlayer({ atk: Number(e.target.value) || 1 })}
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        </label>
        <label>
          DEF
          <input
            type="number"
            min={0}
            value={p.def}
            onChange={(e) => updatePlayer({ def: Number(e.target.value) || 0 })}
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        </label>
      </div>
    </div>
  );
}
