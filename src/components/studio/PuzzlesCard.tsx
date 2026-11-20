"use client";

import { useEditorStore } from "@/store/useEditorStore";

export function PuzzlesCard() {
  const { blueprint, activeFloorId, activeTool, setActiveTool, updateFloorSign } =
    useEditorStore();

  const floor =
    blueprint.floors.find((f) => f.id === activeFloorId) ?? blueprint.floors.at(0);
  const signs = floor?.signs ?? [];

  const tools: [string, string][] = [
    ["sign", "📜 Lore Sign"],
    ["push_block", "📦 Push-Block"],
    ["plate", "🔘 Pressure Plate"],
    ["lever", "🕹️ Wall Lever"],
    ["gate", "🚧 Puzzle Gate"],
  ];

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
      <h3 className="font-semibold uppercase text-zinc-300">
        🧩 Signs, Riddles &amp; Puzzles
      </h3>

      <div className="grid grid-cols-2 gap-1.5">
        {tools.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTool(id as typeof activeTool)}
            className={`rounded-lg border px-2.5 py-1.5 text-left font-medium ${
              activeTool === id
                ? "border-emerald-500 bg-emerald-950/60 text-emerald-200"
                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {signs.length > 0 && (
        <div className="space-y-2 border-t border-zinc-800 pt-2">
          <div className="font-semibold text-amber-300">
            Floor Signs &amp; Riddles ({signs.length})
          </div>
          {signs.map((s) => (
            <div key={s.id} className="space-y-1.5 rounded-lg bg-zinc-950 p-2">
              <input
                value={s.title}
                onChange={(e) => updateFloorSign(s.id, { title: e.target.value })}
                placeholder="Sign Title"
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-semibold"
              />
              <textarea
                rows={2}
                value={s.message}
                onChange={(e) => updateFloorSign(s.id, { message: e.target.value })}
                placeholder="Lore message..."
                className="w-full rounded border border-zinc-700 bg-zinc-900 p-1.5"
              />
              {!s.riddle ? (
                <button
                  type="button"
                  onClick={() =>
                    updateFloorSign(s.id, {
                      riddle: {
                        question: "What walks on four legs at dawn and two at noon?",
                        options: ["A Dragon", "A Human", "A Skeleton"],
                        correctIndex: 1,
                        rewardGold: 25,
                        rewardXp: 30,
                      },
                    })
                  }
                  className="text-emerald-400 hover:underline"
                >
                  + Attach Riddle Reward
                </button>
              ) : (
                <div className="space-y-1 border-t border-zinc-800 pt-1.5">
                  <div className="flex items-center justify-between text-emerald-300">
                    <span>Riddle Question</span>
                    <button
                      type="button"
                      onClick={() => updateFloorSign(s.id, { riddle: undefined })}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={s.riddle.question}
                    onChange={(e) =>
                      updateFloorSign(s.id, {
                        riddle: { ...s.riddle!, question: e.target.value },
                      })
                    }
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                  />
                  {s.riddle.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`riddle-${s.id}`}
                        checked={s.riddle!.correctIndex === idx}
                        onChange={() =>
                          updateFloorSign(s.id, {
                            riddle: { ...s.riddle!, correctIndex: idx },
                          })
                        }
                      />
                      <input
                        value={opt}
                        onChange={(e) =>
                          updateFloorSign(s.id, {
                            riddle: {
                              ...s.riddle!,
                              options: s.riddle!.options.map((o, i) =>
                                i === idx ? e.target.value : o
                              ),
                            },
                          })
                        }
                        className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
