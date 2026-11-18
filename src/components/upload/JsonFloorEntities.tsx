"use client";

import type { ElementType, RpgFloor } from "@/lib/rpg/schema";
import { ItemTypeSelect } from "@/components/studio/ItemTypeSelect";

type Props = {
  floor: RpgFloor;
  onUpdate: (updater: (f: RpgFloor) => RpgFloor) => void;
};

export function JsonFloorEntities({ floor, onUpdate }: Props) {
  const addEnemy = () =>
    onUpdate((f) => ({
      ...f,
      enemies: [
        ...f.enemies,
        {
          id: `mob-${Date.now().toString(36)}`,
          name: "Crypt Guard",
          sprite: "💀",
          x: 2,
          y: 2,
          hp: 35,
          atk: 12,
          def: 3,
          xpReward: 25,
          isBoss: false,
          element: "none",
          aiBehavior: "stationary",
        },
      ],
    }));

  const addChest = () =>
    onUpdate((f) => ({
      ...f,
      chests: [
        ...(f.chests ?? []),
        {
          id: `chest-${Date.now().toString(36)}`,
          x: 3,
          y: 3,
          itemType: "weapon",
          itemName: "Flame Sword",
          value: 4,
          element: "fire",
        },
      ],
    }));

  return (
    <div className="space-y-3 border-t border-zinc-800 pt-2">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-zinc-400">
          <span>Enemies ({floor.enemies.length})</span>
          <button type="button" onClick={addEnemy} className="text-emerald-400 hover:underline">
            + Add Enemy
          </button>
        </div>

        {floor.enemies.map((en, idx) => (
          <div key={en.id} className="grid grid-cols-7 items-center gap-1.5">
            <input
              value={en.sprite}
              onChange={(e) =>
                onUpdate((f) => ({
                  ...f,
                  enemies: f.enemies.map((item, i) =>
                    i === idx ? { ...item, sprite: e.target.value } : item
                  ),
                }))
              }
              className="rounded border border-zinc-700 bg-zinc-900 px-1 py-1 text-center"
            />
            <input
              value={en.name}
              onChange={(e) =>
                onUpdate((f) => ({
                  ...f,
                  enemies: f.enemies.map((item, i) =>
                    i === idx ? { ...item, name: e.target.value } : item
                  ),
                }))
              }
              className="col-span-2 rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
            />
            <input
              type="number"
              title="X"
              value={en.x}
              onChange={(e) =>
                onUpdate((f) => ({
                  ...f,
                  enemies: f.enemies.map((item, i) =>
                    i === idx ? { ...item, x: Number(e.target.value) || 1 } : item
                  ),
                }))
              }
              className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1"
            />
            <input
              type="number"
              title="Y"
              value={en.y}
              onChange={(e) =>
                onUpdate((f) => ({
                  ...f,
                  enemies: f.enemies.map((item, i) =>
                    i === idx ? { ...item, y: Number(e.target.value) || 1 } : item
                  ),
                }))
              }
              className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1"
            />
            <select
              value={en.element ?? "none"}
              onChange={(e) =>
                onUpdate((f) => ({
                  ...f,
                  enemies: f.enemies.map((item, i) =>
                    i === idx ? { ...item, element: e.target.value as ElementType } : item
                  ),
                }))
              }
              className="rounded border border-zinc-700 bg-zinc-900 px-1 py-1"
            >
              <option value="none">None</option>
              <option value="fire">🔥 Fire</option>
              <option value="ice">❄️ Ice</option>
              <option value="venom">🧪 Venom</option>
            </select>
            <div className="flex items-center justify-end gap-1">
              <label title="Boss?" className="flex items-center gap-0.5 text-amber-300">
                <input
                  type="checkbox"
                  checked={en.isBoss}
                  onChange={(e) =>
                    onUpdate((f) => ({
                      ...f,
                      enemies: f.enemies.map((item, i) =>
                        i === idx ? { ...item, isBoss: e.target.checked } : item
                      ),
                    }))
                  }
                />
                👑
              </label>
              <button
                type="button"
                onClick={() =>
                  onUpdate((f) => ({
                    ...f,
                    enemies: f.enemies.filter((_, i) => i !== idx),
                  }))
                }
                className="text-zinc-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 border-t border-zinc-800 pt-2">
        <div className="flex items-center justify-between text-zinc-400">
          <span>Chests ({(floor.chests ?? []).length})</span>
          <button type="button" onClick={addChest} className="text-emerald-400 hover:underline">
            + Add Chest
          </button>
        </div>

        {(floor.chests ?? []).map((ch, idx) => (
          <div key={ch.id} className="grid grid-cols-7 items-center gap-1.5">
            <ItemTypeSelect
              value={ch.itemType}
              onChange={(itemType) =>
                onUpdate((f) => ({
                  ...f,
                  chests: (f.chests ?? []).map((item, i) =>
                    i === idx ? { ...item, itemType } : item
                  ),
                }))
              }
              className="col-span-2 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1"
            />
            <input
              value={ch.itemName}
              onChange={(e) =>
                onUpdate((f) => ({
                  ...f,
                  chests: (f.chests ?? []).map((item, i) =>
                    i === idx ? { ...item, itemName: e.target.value } : item
                  ),
                }))
              }
              className="col-span-2 rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
            />
            <input
              type="number"
              title="X"
              value={ch.x}
              onChange={(e) =>
                onUpdate((f) => ({
                  ...f,
                  chests: (f.chests ?? []).map((item, i) =>
                    i === idx ? { ...item, x: Number(e.target.value) || 1 } : item
                  ),
                }))
              }
              className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1"
            />
            <input
              type="number"
              title="Y"
              value={ch.y}
              onChange={(e) =>
                onUpdate((f) => ({
                  ...f,
                  chests: (f.chests ?? []).map((item, i) =>
                    i === idx ? { ...item, y: Number(e.target.value) || 1 } : item
                  ),
                }))
              }
              className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1"
            />
            <button
              type="button"
              onClick={() =>
                onUpdate((f) => ({
                  ...f,
                  chests: (f.chests ?? []).filter((_, i) => i !== idx),
                }))
              }
              className="text-right text-zinc-500 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
