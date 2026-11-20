"use client";

import { useState } from "react";
import type { ElementType, RpgBossPhase2, RpgEnemy } from "@/lib/rpg/schema";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";
import { PixelArtModal } from "./PixelArtModal";

type Props = {
  enemy: RpgEnemy;
  isPro: boolean;
  onUpdate: (fields: Partial<RpgEnemy>) => void;
};

export function BossPhase2Editor({ enemy, isPro, onUpdate }: Props) {
  const [drawingP2, setDrawingP2] = useState(false);

  if (!enemy.isBoss) return null;

  if (!isPro) {
    return (
      <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 p-2.5 text-[11px] text-amber-200">
        👑 <strong>Creator Pro Perk:</strong> Upgrade on{" "}
        <a href="/billing" className="underline hover:text-white">
          /billing
        </a>{" "}
        to unlock Multi-Phase Boss Transformations!
      </div>
    );
  }

  const enablePhase2 = () => {
    onUpdate({
      phase2: {
        triggerHpPercent: 50,
        name: `Enraged ${enemy.name}`,
        sprite: "🔥",
        atkBonus: 6,
        defBonus: 2,
        element: "fire",
        battleCry: "You have awakened my true form!",
      },
    });
  };

  const updateP2 = (fields: Partial<RpgBossPhase2>) => {
    if (!enemy.phase2) return;
    onUpdate({ phase2: { ...enemy.phase2, ...fields } });
  };

  return (
    <div className="space-y-2 border-t border-zinc-800 pt-2">
      {drawingP2 && enemy.phase2 && (
        <PixelArtModal
          title={`${enemy.phase2.name} (Phase 2 Sprite)`}
          initialSprite={enemy.phase2.sprite}
          onSave={(url) => updateP2({ sprite: url })}
          onClose={() => setDrawingP2(false)}
        />
      )}

      {!enemy.phase2 ? (
        <button
          type="button"
          onClick={enablePhase2}
          className="w-full rounded-lg border border-amber-600/70 bg-amber-950/50 py-1.5 font-semibold text-amber-200 hover:bg-amber-900/60"
        >
          👑 + Add Phase 2 Boss Transformation
        </button>
      ) : (
        <div className="space-y-2 rounded-lg border border-amber-600/60 bg-zinc-950 p-2.5">
          <div className="flex items-center justify-between font-bold text-amber-300">
            <span>👑 Phase 2 Transformation</span>
            <button
              type="button"
              onClick={() => onUpdate({ phase2: undefined })}
              className="text-zinc-500 hover:text-red-400"
            >
              Remove
            </button>
          </div>

          <input
            value={enemy.phase2.name}
            onChange={(e) => updateP2({ name: e.target.value })}
            placeholder="Phase 2 Boss Name"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
          />

          <div className="flex items-center justify-between rounded bg-zinc-900 px-2 py-1">
            <div className="flex items-center gap-2">
              <SpriteDisplay sprite={enemy.phase2.sprite} sizeClass="h-6 w-6" />
              {!enemy.phase2.sprite.startsWith("data:image/") && (
                <input
                  value={enemy.phase2.sprite}
                  maxLength={8}
                  onChange={(e) => updateP2({ sprite: e.target.value })}
                  className="w-12 rounded border border-zinc-700 bg-zinc-950 px-1 py-0.5 text-center"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => setDrawingP2(true)}
              className="rounded border border-emerald-700 bg-emerald-950/60 px-2 py-0.5 text-emerald-300"
            >
              🎨 Draw Phase 2
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <label>
              Trigger HP %
              <input
                type="number"
                min={10}
                max={90}
                value={enemy.phase2.triggerHpPercent}
                onChange={(e) =>
                  updateP2({
                    triggerHpPercent: Math.min(90, Math.max(10, Number(e.target.value) || 50)),
                  })
                }
                className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5"
              />
            </label>
            <label>
              +ATK Bonus
              <input
                type="number"
                min={0}
                max={100}
                value={enemy.phase2.atkBonus}
                onChange={(e) =>
                  updateP2({ atkBonus: Math.max(0, Number(e.target.value) || 0) })
                }
                className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5"
              />
            </label>
            <label>
              +DEF Bonus
              <input
                type="number"
                min={0}
                max={100}
                value={enemy.phase2.defBonus}
                onChange={(e) =>
                  updateP2({ defBonus: Math.max(0, Number(e.target.value) || 0) })
                }
                className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5"
              />
            </label>
          </div>

          <select
            value={enemy.phase2.element}
            onChange={(e) => updateP2({ element: e.target.value as ElementType })}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
          >
            <option value="none">Phase 2 Element: None</option>
            <option value="fire">🔥 Fire (Burn)</option>
            <option value="ice">❄️ Ice (Freeze)</option>
            <option value="venom">🧪 Venom (Poison)</option>
          </select>

          <input
            value={enemy.phase2.battleCry}
            onChange={(e) => updateP2({ battleCry: e.target.value })}
            placeholder="Transformation battle cry..."
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
          />
        </div>
      )}
    </div>
  );
}
