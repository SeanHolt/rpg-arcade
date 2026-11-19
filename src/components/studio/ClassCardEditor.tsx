"use client";

import type { ElementType, RpgHeroClass, RpgStarterItem } from "@/lib/rpg/schema";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";
import { ClassSkillEditor } from "./ClassSkillEditor";
import { ItemTypeSelect } from "./ItemTypeSelect";

type Props = {
    cls: RpgHeroClass;
    onDrawSprite: () => void;
    onUpdate: (fields: Partial<RpgHeroClass>) => void;
    onRemove: () => void;
    onSetItems: (items: RpgStarterItem[]) => void;
    onDrawFrame2: () => void;
};

export function ClassCardEditor({
    cls,
    onDrawSprite,
    onUpdate,
    onRemove,
    onSetItems,
    onDrawFrame2
}: Props) {
    const addItem = () => {
        if (cls.starterItems.length >= 5) return;
        onSetItems([
            ...cls.starterItems,
            { itemType: "potion", itemName: "Minor Potion", value: 30, element: "none" },
        ]);
    };

    return (
        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs">
            <div className="flex items-center gap-2">
                <SpriteDisplay sprite={cls.sprite} sizeClass="h-7 w-7" frame2={cls.spriteFrame2} />
                {!cls.sprite.startsWith("data:image/") && (
                    <input
                        value={cls.sprite}
                        maxLength={8}
                        onChange={(e) => onUpdate({ sprite: e.target.value })}
                        className="w-11 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1 text-center"
                    />
                )}
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onDrawSprite}
                        className="rounded border border-emerald-700 bg-emerald-950/60 px-2 py-1 text-emerald-300 hover:bg-emerald-900/60"
                    >
                        🎨 Frame 1
                    </button>
                    <button
                        type="button"
                        onClick={onDrawFrame2}
                        className="rounded border border-purple-700 bg-purple-950/60 px-2 py-1 text-purple-300 hover:bg-purple-900/60"
                    >
                        🎬 Frame 2
                    </button>
                    {cls.spriteFrame2 && (
                        <button
                            type="button"
                            title="Clear Frame 2"
                            onClick={() => onUpdate({ spriteFrame2: undefined })}
                            className="text-zinc-500 hover:text-red-400"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <input
                    value={cls.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="Class Name"
                    className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 font-semibold"
                />
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded border border-red-900/70 px-2 py-1 text-red-400 hover:bg-red-950/50"
                >
                    ✕
                </button>
            </div>

            <input
                value={cls.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Short class description..."
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-zinc-300"
            />

            <div className="grid grid-cols-2 gap-2">
                <label>
                    Combat Style
                    <select
                        value={cls.combatType}
                        onChange={(e) => {
                            const combatType = e.target.value as "melee" | "ranged";
                            onUpdate({
                                combatType,
                                range: combatType === "ranged" ? Math.max(2, cls.range) : 1,
                            });
                        }}
                        className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                    >
                        <option value="melee">Melee (Adjacent)</option>
                        <option value="ranged">Ranged (Distance)</option>
                    </select>
                </label>
                <label>
                    Element
                    <select
                        value={cls.element ?? "none"}
                        onChange={(e) => onUpdate({ element: e.target.value as ElementType })}
                        className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                    >
                        <option value="none">None (Physical)</option>
                        <option value="fire">🔥 Fire (Burn DoT)</option>
                        <option value="ice">❄️ Ice (Freeze Stun)</option>
                        <option value="venom">🧪 Venom (Poison DoT)</option>
                    </select>
                </label>

                {cls.combatType === "ranged" && (
                    <label>
                        Range (2–5 tiles)
                        <input
                            type="number"
                            min={2}
                            max={5}
                            value={cls.range}
                            onChange={(e) =>
                                onUpdate({ range: Math.min(5, Math.max(2, Number(e.target.value) || 2)) })
                            }
                            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                        />
                    </label>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2">
                <label>
                    Max HP
                    <input
                        type="number"
                        min={10}
                        value={cls.maxHp}
                        onChange={(e) => onUpdate({ maxHp: Number(e.target.value) || 10 })}
                        className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                    />
                </label>
                <label>
                    ATK
                    <input
                        type="number"
                        min={1}
                        value={cls.atk}
                        onChange={(e) => onUpdate({ atk: Number(e.target.value) || 1 })}
                        className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                    />
                </label>
                <label>
                    DEF
                    <input
                        type="number"
                        min={0}
                        value={cls.def}
                        onChange={(e) => onUpdate({ def: Number(e.target.value) || 0 })}
                        className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                    />
                </label>
            </div>

            <div className="space-y-1.5 border-t border-zinc-800 pt-2">
                <div className="flex items-center justify-between text-zinc-400">
                    <span>Starter Items ({cls.starterItems.length}/5)</span>
                    <button type="button" onClick={addItem} className="text-emerald-400 hover:underline">
                        + Item
                    </button>
                </div>

                {cls.starterItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                        <ItemTypeSelect
                            value={item.itemType}
                            onChange={(itemType) =>
                                onSetItems(
                                    cls.starterItems.map((it, i) => (i === idx ? { ...it, itemType } : it))
                                )
                            }
                            className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1"
                        />
                        <input
                            value={item.itemName}
                            onChange={(e) =>
                                onSetItems(
                                    cls.starterItems.map((it, i) =>
                                        i === idx ? { ...it, itemName: e.target.value } : it
                                    )
                                )
                            }
                            className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                        />

                        <input
                            type="number"
                            min={1}
                            value={item.value}
                            onChange={(e) =>
                                onSetItems(
                                    cls.starterItems.map((it, i) =>
                                        i === idx ? { ...it, value: Number(e.target.value) || 1 } : it
                                    )
                                )
                            }
                            className="w-14 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1"
                        />

                        <button
                            type="button"
                            onClick={() => onSetItems(cls.starterItems.filter((_, i) => i !== idx))}
                            className="text-zinc-500 hover:text-red-400"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
            <ClassSkillEditor skill={cls.skill} onChange={(skill) => onUpdate({ skill })} />
        </div>
    );
}
