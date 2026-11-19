"use client";

import { useEditorStore } from "@/store/useEditorStore";

export function HazardsCard() {
  const {
    blueprint,
    activeFloorId,
    activeTool,
    setActiveTool,
    activeTrapType,
    activeTrapDamage,
    setActiveTrapConfig,
  } = useEditorStore();

  const floor =
    blueprint.floors.find((f) => f.id === activeFloorId) ?? blueprint.floors[0];
  const secretCount = floor?.secretWalls?.length ?? 0;
  const trapCount = floor?.traps?.length ?? 0;

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
      <h3 className="font-semibold uppercase text-zinc-300">
        ⚠️ Secret Walls &amp; Floor Traps
      </h3>

      <button
        type="button"
        onClick={() => setActiveTool("secret_wall")}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 font-medium ${
          activeTool === "secret_wall"
            ? "border-amber-500 bg-amber-950/60 text-amber-200"
            : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
        }`}
      >
        <span>🧱 Toggle Cracked Secret Wall (Click `#` Wall)</span>
        <span className="font-mono text-zinc-400">{secretCount}</span>
      </button>

      <div className="space-y-2 border-t border-zinc-800 pt-2">
        <button
          type="button"
          onClick={() => setActiveTool("trap")}
          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 font-medium ${
            activeTool === "trap"
              ? "border-red-500 bg-red-950/60 text-red-200"
              : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          <span>⚙️ Toggle Floor Trap (Click `.` Floor)</span>
          <span className="font-mono text-zinc-400">{trapCount}</span>
        </button>

        <div className="grid grid-cols-3 gap-1.5">
          <select
            value={activeTrapType}
            onChange={(e) =>
              setActiveTrapConfig(
                e.target.value as "spikes" | "poison_vent" | "lava_crack",
                activeTrapDamage
              )
            }
            className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          >
            <option value="spikes">⚙️ Spike Trap</option>
            <option value="poison_vent">🧪 Poison Vent</option>
            <option value="lava_crack">🌋 Lava Crack</option>
          </select>

          <input
            type="number"
            min={1}
            max={100}
            title="Trap Damage"
            value={activeTrapDamage}
            onChange={(e) =>
              setActiveTrapConfig(
                activeTrapType,
                Math.min(100, Math.max(1, Number(e.target.value) || 8))
              )
            }
            className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
}
