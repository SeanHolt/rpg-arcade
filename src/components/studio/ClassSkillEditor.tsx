"use client";

import type { RpgClassSkill } from "@/lib/rpg/schema";

type Props = {
  skill?: RpgClassSkill;
  onChange: (skill?: RpgClassSkill) => void;
};

export function ClassSkillEditor({ skill, onChange }: Props) {
  const enableSkill = () => {
    onChange({
      name: "Power Cleave",
      type: "cleave",
      cooldown: 4,
    });
  };

  if (!skill) {
    return (
      <div className="border-t border-zinc-800 pt-2">
        <button
          type="button"
          onClick={enableSkill}
          className="w-full rounded border border-purple-800/70 bg-purple-950/40 py-1.5 font-semibold text-purple-300 hover:bg-purple-900/50"
        >
          + Add Signature Skill [Q]
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 border-t border-zinc-800 pt-2">
      <div className="flex items-center justify-between font-semibold text-purple-300">
        <span>⚡ Signature Skill [Q]</span>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-zinc-500 hover:text-red-400"
        >
          Remove
        </button>
      </div>

      <input
        value={skill.name}
        onChange={(e) => onChange({ ...skill, name: e.target.value })}
        placeholder="Skill Name (e.g. Whirlwind)"
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
      />

      <div className="grid grid-cols-2 gap-1.5">
        <label>
          Effect
          <select
            value={skill.type}
            onChange={(e) =>
              onChange({
                ...skill,
                type: e.target.value as RpgClassSkill["type"],
              })
            }
            className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1"
          >
            <option value="cleave">Cleave (Adjacent AoE)</option>
            <option value="piercing_shot">Piercing Shot (1.3x Ignore DEF)</option>
            <option value="mend">Mend (Heal 35% Max HP)</option>
            <option value="blink">Blink (Teleport 2 Tiles)</option>
          </select>
        </label>

        <label>
          Cooldown (Turns)
          <input
            type="number"
            min={1}
            max={12}
            value={skill.cooldown}
            onChange={(e) =>
              onChange({
                ...skill,
                cooldown: Math.min(12, Math.max(1, Number(e.target.value) || 1)),
              })
            }
            className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
          />
        </label>
      </div>
    </div>
  );
}
