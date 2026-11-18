"use client";

import type { RpgEnemy, RpgEnemySpecial } from "@/lib/rpg/schema";

type Props = {
  enemy: RpgEnemy;
  onUpdate: (fields: Partial<RpgEnemy>) => void;
};

export function EnemyAiEditor({ enemy, onUpdate }: Props) {
  const enableSpecial = () => {
    onUpdate({
      specialAttack: {
        name: enemy.isBoss ? "Overlord Slam" : "Heavy Strike",
        multiplier: 2,
        cooldown: 3,
      },
    });
  };

  const updateSpecial = (fields: Partial<RpgEnemySpecial>) => {
    if (!enemy.specialAttack) return;
    onUpdate({ specialAttack: { ...enemy.specialAttack, ...fields } });
  };

  return (
    <div className="space-y-2 border-t border-zinc-800 pt-2">
      <label className="block">
        AI Movement Behavior
        <select
          value={enemy.aiBehavior ?? "stationary"}
          onChange={(e) =>
            onUpdate({
              aiBehavior: e.target.value as "stationary" | "patrol" | "hunter",
            })
          }
          className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
        >
          <option value="stationary">Stationary (Holds Post)</option>
          <option value="patrol">Patrol (Wanders + 3-Tile Aggro)</option>
          <option value="hunter">Hunter (Stalks Within 5 Tiles)</option>
        </select>
      </label>

      {!enemy.specialAttack ? (
        <button
          type="button"
          onClick={enableSpecial}
          className="w-full rounded border border-amber-800/70 bg-amber-950/40 py-1.5 font-semibold text-amber-300 hover:bg-amber-900/50"
        >
          + Add Telegraphed Special Attack
        </button>
      ) : (
        <div className="space-y-1.5 rounded-lg border border-amber-800/50 bg-zinc-950 p-2">
          <div className="flex items-center justify-between font-semibold text-amber-300">
            <span>⚠️ Telegraphed Special</span>
            <button
              type="button"
              onClick={() => onUpdate({ specialAttack: undefined })}
              className="text-zinc-500 hover:text-red-400"
            >
              Remove
            </button>
          </div>

          <input
            value={enemy.specialAttack.name}
            onChange={(e) => updateSpecial({ name: e.target.value })}
            placeholder="Special Attack Name"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
          />

          <div className="grid grid-cols-2 gap-1.5">
            <label>
              DMG Multiplier
              <input
                type="number"
                step={0.1}
                min={1.2}
                max={3.5}
                value={enemy.specialAttack.multiplier}
                onChange={(e) =>
                  updateSpecial({
                    multiplier: Math.min(3.5, Math.max(1.2, Number(e.target.value) || 2)),
                  })
                }
                className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
              />
            </label>
            <label>
              Cooldown (Turns)
              <input
                type="number"
                min={2}
                max={8}
                value={enemy.specialAttack.cooldown}
                onChange={(e) =>
                  updateSpecial({
                    cooldown: Math.min(8, Math.max(2, Number(e.target.value) || 3)),
                  })
                }
                className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
