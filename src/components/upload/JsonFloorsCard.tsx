"use client";

import type { RpgBlueprint, RpgFloor } from "@/lib/rpg/schema";
import { createBlankGrid } from "@/lib/rpg/editor-helpers";
import { JsonFloorEntities } from "./JsonFloorEntities";

type Props = {
  blueprint: RpgBlueprint;
  onChange: (updated: RpgBlueprint) => void;
};

export function JsonFloorsCard({ blueprint, onChange }: Props) {
  const updateFloor = (floorId: string, updater: (f: RpgFloor) => RpgFloor) => {
    onChange({
      ...blueprint,
      floors: blueprint.floors.map((f) => (f.id === floorId ? updater(f) : f)),
    });
  };

  const addFloor = () => {
    const id = `floor-${Date.now().toString(36)}`;
    onChange({
      ...blueprint,
      floors: [
        ...blueprint.floors,
        {
          id,
          name: `Floor ${blueprint.floors.length + 1}`,
          grid: createBlankGrid(10),
          enemies: [],
          chests: [],
          npcs: [],
          stairways: [],
        },
      ],
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 text-xs">
      <div className="flex items-center justify-between">
        <h2 className="font-bold uppercase tracking-wider text-zinc-300">
          3. Floors, ASCII Map Grids &amp; Entities ({blueprint.floors.length})
        </h2>
        <button
          type="button"
          onClick={addFloor}
          className="rounded-lg border border-emerald-700 bg-emerald-950/60 px-3 py-1 font-semibold text-emerald-300 hover:bg-emerald-900/60"
        >
          + Add Floor
        </button>
      </div>

      {blueprint.floors.map((floor) => (
        <div
          key={floor.id}
          className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <input
              value={floor.name}
              onChange={(e) =>
                updateFloor(floor.id, (f) => ({ ...f, name: e.target.value }))
              }
              className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-semibold text-zinc-100"
            />
            {blueprint.floors.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...blueprint,
                    floors: blueprint.floors.filter((f) => f.id !== floor.id),
                  })
                }
                className="rounded border border-red-900/60 px-2 py-1 text-red-400"
              >
                Delete Floor
              </button>
            )}
          </div>

          <label className="block text-zinc-400">
            Tile Map (# = Wall, . = Floor, S = Stairs, H = Shrine)
            <textarea
              rows={floor.grid.length}
              value={floor.grid.join("\n")}
              onChange={(e) =>
                updateFloor(floor.id, (f) => ({
                  ...f,
                  grid: e.target.value.split("\n").map((r) => r.trim()),
                }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 font-mono text-xs tracking-widest text-emerald-300"
            />
          </label>

          <JsonFloorEntities
            floor={floor}
            onUpdate={(updater) => updateFloor(floor.id, updater)}
          />
        </div>
      ))}
    </div>
  );
}
