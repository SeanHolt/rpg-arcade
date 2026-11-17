"use client";

import { useState } from "react";
import type { RpgNpc } from "@/lib/rpg/schema";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";
import { PixelArtModal } from "./PixelArtModal";
import { NpcQuestEditor } from "./NpcQuestEditor";
import { ItemTypeSelect } from "./ItemTypeSelect";

type Props = {
  npc: RpgNpc;
  onUpdate: (fields: Partial<RpgNpc>) => void;
};

export function NpcInspectorCard({ npc, onUpdate }: Props) {
  const [drawing, setDrawing] = useState(false);

  const addShopItem = () => {
    if (npc.shopItems.length >= 6) return;
    onUpdate({
      shopItems: [
        ...npc.shopItems,
        {
          id: `shop-${Date.now().toString(36)}`,
          itemType: "potion",
          itemName: "Healing Draught",
          value: 40,
          goldCost: 15,
          element: "none",
        },
      ],
    });
  };

  return (
    <div className="space-y-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
      {drawing && (
        <PixelArtModal
          title={`NPC: ${npc.name}`}
          onSave={(url) => onUpdate({ sprite: url })}
          onClose={() => setDrawing(false)}
        />
      )}

      <h3 className="font-semibold uppercase text-zinc-400">Selected NPC</h3>
      <input
        value={npc.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1.5"
      />

      <div className="flex items-center justify-between rounded bg-zinc-950 px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <SpriteDisplay sprite={npc.sprite} sizeClass="h-6 w-6" />
          {!npc.sprite.startsWith("data:image/") && (
            <input
              value={npc.sprite}
              maxLength={8}
              onChange={(e) => onUpdate({ sprite: e.target.value })}
              className="w-12 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-center"
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => setDrawing(true)}
          className="rounded border border-emerald-700 bg-emerald-950/60 px-2 py-1 text-emerald-300"
        >
          🎨 Sprite
        </button>
      </div>

      <select
        value={npc.role}
        onChange={(e) => onUpdate({ role: e.target.value as "story" | "merchant" })}
        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5"
      >
        <option value="story">Story / Dialogue Only</option>
        <option value="merchant">Merchant (Sells Items)</option>
      </select>

      <textarea
        rows={2}
        value={npc.dialogue}
        onChange={(e) => onUpdate({ dialogue: e.target.value })}
        placeholder="What does this NPC say?"
        className="w-full rounded border border-zinc-700 bg-zinc-950 p-2"
      />

      {npc.role === "merchant" && (
        <div className="space-y-1.5 border-t border-zinc-800 pt-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Shop Items ({npc.shopItems.length}/6)</span>
            <button type="button" onClick={addShopItem} className="text-emerald-400 hover:underline">
              + Item
            </button>
          </div>
          {npc.shopItems.map((item, idx) => (
            <div key={item.id} className="space-y-1 rounded bg-zinc-950 p-2">
              <div className="flex gap-1">
                <input
                  value={item.itemName}
                  onChange={(e) =>
                    onUpdate({
                      shopItems: npc.shopItems.map((s, i) =>
                        i === idx ? { ...s, itemName: e.target.value } : s
                      ),
                    })
                  }
                  className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdate({ shopItems: npc.shopItems.filter((_, i) => i !== idx) })
                  }
                  className="text-zinc-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <ItemTypeSelect
                  value={item.itemType}
                  onChange={(itemType) =>
                    onUpdate({
                      shopItems: npc.shopItems.map((s, i) =>
                        i === idx ? { ...s, itemType } : s
                      ),
                    })
                  }
                  className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5"
                />
                <input
                  type="number"
                  min={1}
                  title="Stat / Heal Value"
                  value={item.value}
                  onChange={(e) =>
                    onUpdate({
                      shopItems: npc.shopItems.map((s, i) =>
                        i === idx ? { ...s, value: Number(e.target.value) || 1 } : s
                      ),
                    })
                  }
                  className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5"
                />
                <input
                  type="number"
                  min={1}
                  title="Gold Cost"
                  value={item.goldCost}
                  onChange={(e) =>
                    onUpdate({
                      shopItems: npc.shopItems.map((s, i) =>
                        i === idx ? { ...s, goldCost: Number(e.target.value) || 1 } : s
                      ),
                    })
                  }
                  className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <NpcQuestEditor quest={npc.quest} onChange={(quest) => onUpdate({ quest })} />
    </div>
  );
}
