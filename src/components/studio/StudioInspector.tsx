"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";
import { PixelArtModal } from "./PixelArtModal";
import { NpcInspectorCard } from "./NpcInspectorCard";
import type { ElementType } from "@/lib/rpg/schema";
import { ItemTypeSelect } from "./ItemTypeSelect";
import { EnemyAiEditor } from "./EnemyAiEditor";
import { MusicSequencerCard } from "./MusicSequencerCard";

type TileSlot = "wall" | "floor" | "stairs" | "shrine" | "chest";

export function StudioInspector() {
    const {
        blueprint,
        activeFloorId,
        selectedEnemyId,
        selectedChestId,
        selectedNpcId,
        renameFloor,
        resizeActiveFloor,
        updateEnemy,
        updateChest,
        updateNpc,
        setStairTarget,
        setCustomSprite,
        setFloorMusic,
    } = useEditorStore();

    const [drawingEnemy, setDrawingEnemy] = useState(false);
    const [drawingTile, setDrawingTile] = useState<TileSlot | null>(null);

    const floor =
        blueprint.floors.find((f) => f.id === activeFloorId) ?? blueprint.floors.at(0)!;
    const enemy = floor.enemies.find((e) => e.id === selectedEnemyId);
    const chest = (floor.chests ?? []).find((c) => c.id === selectedChestId);
    const npc = (floor.npcs ?? []).find((n) => n.id === selectedNpcId);

    return (
        <aside className="space-y-4">
            {drawingEnemy && enemy && (
                <PixelArtModal
                    title={enemy.name}
                    onSave={(dataUrl) => updateEnemy(enemy.id, { sprite: dataUrl })}
                    onClose={() => setDrawingEnemy(false)}
                />
            )}

            {drawingTile && (
                <PixelArtModal
                    title={`Tile: ${drawingTile}`}
                    onSave={(dataUrl) => setCustomSprite(drawingTile, dataUrl)}
                    onClose={() => setDrawingTile(null)}
                />
            )}

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
                <h3 className="font-semibold uppercase text-zinc-400">Floor Name</h3>
                <input
                    value={floor.name}
                    onChange={(e) => renameFloor(floor.id, e.target.value)}
                    className="mt-2 w-full rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-sm"
                />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
                <h3 className="font-semibold uppercase text-zinc-400">Floor Dimensions (8–24)</h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <label>
                        Width
                        <input
                            type="number"
                            min={8}
                            max={24}
                            value={floor.grid.at(0)?.length ?? 10}
                            onChange={(e) =>
                                resizeActiveFloor(Number(e.target.value) || 8, floor.grid.length)
                            }
                            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
                        />
                    </label>
                    <label>
                        Height
                        <input
                            type="number"
                            min={8}
                            max={24}
                            value={floor.grid.length}
                            onChange={(e) =>
                                resizeActiveFloor(floor.grid.at(0)?.length ?? 10, Number(e.target.value) || 8)
                            }
                            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
                        />
                    </label>
                </div>
                <MusicSequencerCard
                    floorName={floor.name}
                    themeId={blueprint.theme}
                    musicTrack={floor.musicTrack}
                    onChange={setFloorMusic}
                />
            </div>

            <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
                <h3 className="font-semibold uppercase text-zinc-400">Custom Tile Pixel Art</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {(["wall", "floor", "stairs", "shrine", "chest"] as TileSlot[]).map((slot) => {
                        const custom = blueprint.customSprites?.[slot];
                        return (
                            <div
                                key={slot}
                                className="flex items-center justify-between rounded bg-zinc-950 px-2 py-1.5"
                            >
                                <span className="capitalize text-zinc-300">{slot}</span>
                                <div className="flex items-center gap-1">
                                    {custom && <SpriteDisplay sprite={custom} sizeClass="h-4 w-4" />}
                                    <button
                                        type="button"
                                        onClick={() => setDrawingTile(slot)}
                                        className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-300 hover:bg-zinc-700"
                                    >
                                        🎨
                                    </button>
                                    {custom && (
                                        <button
                                            type="button"
                                            onClick={() => setCustomSprite(slot, undefined)}
                                            className="text-zinc-500 hover:text-red-400"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {npc && <NpcInspectorCard npc={npc} onUpdate={(f) => updateNpc(npc.id, f)} />}

            {chest && (
                <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
                    <h3 className="font-semibold uppercase text-zinc-400">Selected Chest</h3>
                    <input
                        value={chest.itemName}
                        onChange={(e) => updateChest(chest.id, { itemName: e.target.value })}
                        placeholder="Item Name"
                        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1.5"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <label>
                            Type
                            <ItemTypeSelect
                                value={chest.itemType}
                                onChange={(itemType) => updateChest(chest.id, { itemType })}
                                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
                            />
                        </label>            <label>
                            Value
                            <input
                                type="number"
                                min={1}
                                value={chest.value}
                                onChange={(e) =>
                                    updateChest(chest.id, { value: Number(e.target.value) || 1 })
                                }
                                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
                            />
                        </label>
                    </div>

                    {chest.itemType === "weapon" && (
                        <label className="block">
                            Weapon Element
                            <select
                                value={chest.element ?? "none"}
                                onChange={(e) =>
                                    updateChest(chest.id, { element: e.target.value as ElementType })
                                }
                                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
                            >
                                <option value="none">None (Physical)</option>
                                <option value="fire">🔥 Fire (Burn DoT)</option>
                                <option value="ice">❄️ Ice (Freeze Stun)</option>
                                <option value="venom">🧪 Venom (Poison DoT)</option>
                            </select>
                        </label>
                    )}
                </div>
            )}

            {enemy && (
                <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
                    <h3 className="font-semibold uppercase text-zinc-400">
                        Selected {enemy.isBoss ? "Boss" : "Monster"}
                    </h3>
                    <input
                        value={enemy.name}
                        onChange={(e) => updateEnemy(enemy.id, { name: e.target.value })}
                        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1.5"
                    />
                    <div className="flex items-center justify-between rounded bg-zinc-950 px-2.5 py-1.5">
                        <div className="flex items-center gap-2">
                            <SpriteDisplay sprite={enemy.sprite} sizeClass="h-6 w-6" />
                            {!enemy.sprite.startsWith("data:image/") && (
                                <input
                                    value={enemy.sprite}
                                    maxLength={8}
                                    onChange={(e) => updateEnemy(enemy.id, { sprite: e.target.value })}
                                    className="w-14 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-center"
                                />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setDrawingEnemy(true)}
                            className="rounded border border-emerald-700 bg-emerald-950/60 px-2.5 py-1 font-medium text-emerald-300 hover:bg-emerald-900/60"
                        >
                            🎨 Draw / Upload
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <label>
                            HP
                            <input
                                type="number"
                                value={enemy.hp}
                                onChange={(e) => updateEnemy(enemy.id, { hp: Number(e.target.value) || 1 })}
                                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
                            />
                        </label>
                        <label>
                            ATK
                            <input
                                type="number"
                                value={enemy.atk}
                                onChange={(e) => updateEnemy(enemy.id, { atk: Number(e.target.value) || 1 })}
                                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
                            />
                        </label>
                    </div>
                    <label className="block">
                        Elemental Affinity
                        <select
                            value={enemy.element ?? "none"}
                            onChange={(e) =>
                                updateEnemy(enemy.id, { element: e.target.value as ElementType })
                            }
                            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
                        >
                            <option value="none">None (Physical)</option>
                            <option value="fire">🔥 Fire (Burn DoT)</option>
                            <option value="ice">❄️ Ice (Freeze Stun)</option>
                            <option value="venom">🧪 Venom (Poison DoT)</option>
                        </select>
                    </label>
                    <EnemyAiEditor enemy={enemy} onUpdate={(fields) => updateEnemy(enemy.id, fields)} />
                </div>
            )}

            {floor.stairways.length > 0 && (
                <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
                    <h3 className="font-semibold uppercase text-zinc-400">Stairway Links</h3>
                    {floor.stairways.map((st, idx) => (
                        <div key={idx} className="space-y-1 rounded bg-zinc-950 p-2">
                            <div className="text-zinc-400">
                                ({st.from.x}, {st.from.y}) → Target Floor:
                            </div>
                            <select
                                value={st.toFloorId}
                                onChange={(e) =>
                                    setStairTarget(st.from.x, st.from.y, e.target.value, st.to.x, st.to.y)
                                }
                                className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                            >
                                {blueprint.floors.map((tf) => (
                                    <option key={tf.id} value={tf.id}>
                                        {tf.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </aside>
    );
}
