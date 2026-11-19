"use client";

import { useEditorStore } from "@/store/useEditorStore";

export function RoomToolsCard() {
  const {
    blueprint,
    activeFloorId,
    rotateActiveFloor,
    flipActiveFloor,
    applyRoomPrefab,
    addPortalRune,
    updatePortalRune,
    removePortalRune,
  } = useEditorStore();

  const floor =
    blueprint.floors.find((f) => f.id === activeFloorId) ?? blueprint.floors[0];
  const portals = floor?.portals ?? [];
  const maxIndex = Math.max(1, (floor?.grid.length ?? 10) - 2);

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
      <h3 className="font-semibold uppercase text-zinc-300">
        🏛️ Room Stamps &amp; Floor Tools
      </h3>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={rotateActiveFloor}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 font-medium text-zinc-200 hover:bg-zinc-800"
        >
          ↻ Rotate Floor 90°
        </button>
        <button
          type="button"
          onClick={flipActiveFloor}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 font-medium text-zinc-200 hover:bg-zinc-800"
        >
          ↔ Flip Horizontal
        </button>
      </div>

      <div>
        <div className="mb-1 text-zinc-400">Stamp Interior Room Prefab</div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => applyRoomPrefab("arena")}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-zinc-300 hover:border-emerald-500"
          >
            ⚔️ Arena
          </button>
          <button
            type="button"
            onClick={() => applyRoomPrefab("vault")}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-zinc-300 hover:border-emerald-500"
          >
            💎 Vault
          </button>
          <button
            type="button"
            onClick={() => applyRoomPrefab("sanctuary")}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-zinc-300 hover:border-emerald-500"
          >
            ✨ Shrine
          </button>
        </div>
      </div>

      {/* Portal Runes Editor */}
      <div className="space-y-2 border-t border-zinc-800 pt-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-cyan-300">
            🌀 Portal Runes ({portals.length}/12)
          </span>
          <button
            type="button"
            onClick={addPortalRune}
            className="text-emerald-400 hover:underline"
          >
            + Add Portal
          </button>
        </div>

        {portals.map((pt) => (
          <div key={pt.id} className="space-y-1.5 rounded-lg bg-zinc-950 p-2">
            <div className="flex items-center justify-between gap-1">
              <select
                value={pt.color}
                onChange={(e) =>
                  updatePortalRune(pt.id, {
                    color: e.target.value as "cyan" | "purple" | "amber",
                  })
                }
                className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5"
              >
                <option value="cyan">🔵 Cyan Rune</option>
                <option value="purple">🟣 Purple Rune</option>
                <option value="amber">🟡 Amber Rune</option>
              </select>

              <label className="flex items-center gap-1 text-zinc-400">
                <input
                  type="checkbox"
                  checked={pt.oneWay}
                  onChange={(e) => updatePortalRune(pt.id, { oneWay: e.target.checked })}
                />
                One-Way
              </label>

              <button
                type="button"
                onClick={() => removePortalRune(pt.id)}
                className="text-zinc-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1 text-[11px]">
              <label>
                From X
                <input
                  type="number"
                  min={1}
                  max={maxIndex}
                  value={pt.x}
                  onChange={(e) =>
                    updatePortalRune(pt.id, { x: Number(e.target.value) || 1 })
                  }
                  className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5"
                />
              </label>
              <label>
                From Y
                <input
                  type="number"
                  min={1}
                  max={maxIndex}
                  value={pt.y}
                  onChange={(e) =>
                    updatePortalRune(pt.id, { y: Number(e.target.value) || 1 })
                  }
                  className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5"
                />
              </label>
              <label>
                To X
                <input
                  type="number"
                  min={1}
                  max={maxIndex}
                  value={pt.targetX}
                  onChange={(e) =>
                    updatePortalRune(pt.id, { targetX: Number(e.target.value) || 1 })
                  }
                  className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5"
                />
              </label>
              <label>
                To Y
                <input
                  type="number"
                  min={1}
                  max={maxIndex}
                  value={pt.targetY}
                  onChange={(e) =>
                    updatePortalRune(pt.id, { targetY: Number(e.target.value) || 1 })
                  }
                  className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
