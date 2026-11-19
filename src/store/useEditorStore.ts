import { create } from "zustand";
import type {
  RpgBlueprint,
  RpgChest,
  RpgEnemy,
  RpgFloor,
  RpgFloorMusic,
  RpgHeroClass,
  RpgNpc,
  RpgStarterItem,
} from "@/lib/rpg/schema";
import {
  createBlankGrid,
  createDefaultBlueprint,
  resizeFloorGrid,
  type BrushTool,
} from "@/lib/rpg/editor-helpers";
import { applyCellPaint } from "@/lib/rpg/editor-paint";

export type { BrushTool };

type EditorStore = {
  blueprint: RpgBlueprint;
  activeFloorId: string;
  activeTool: BrushTool;
  selectedEnemyId: string | null;
  selectedChestId: string | null;
  selectedNpcId: string | null;

  loadBlueprint: (bp?: RpgBlueprint) => void;
  setActiveFloor: (floorId: string) => void;
  setActiveTool: (tool: BrushTool) => void;
  selectEnemy: (id: string | null) => void;
  selectChest: (id: string | null) => void;
  selectNpc: (id: string | null) => void;
  updateMeta: (fields: Partial<RpgBlueprint>) => void;
  setCustomSprite: (
    slot: "wall" | "floor" | "stairs" | "shrine" | "chest" | "shrineFrame2",
    sprite?: string,
  ) => void;
  addFloor: (maxFloors: number) => void;
  renameFloor: (floorId: string, name: string) => void;
  resizeActiveFloor: (width: number, height: number) => void;
  paintCell: (x: number, y: number) => void;
  updateEnemy: (enemyId: string, fields: Partial<RpgEnemy>) => void;
  updateChest: (chestId: string, fields: Partial<RpgChest>) => void;
  updateNpc: (npcId: string, fields: Partial<RpgNpc>) => void;
  setStairTarget: (
    fromX: number,
    fromY: number,
    toFloorId: string,
    toX: number,
    toY: number,
  ) => void;
  addHeroClass: (maxClasses: number) => void;
  updateHeroClass: (classId: string, fields: Partial<RpgHeroClass>) => void;
  removeHeroClass: (classId: string) => void;
  setClassStarterItems: (classId: string, items: RpgStarterItem[]) => void;
  setFloorMusic: (track?: RpgFloorMusic) => void;
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  blueprint: createDefaultBlueprint(),
  activeFloorId: "floor-1",
  activeTool: "wall",
  selectedEnemyId: "boss-1",
  selectedChestId: null,
  selectedNpcId: null,

  loadBlueprint: (bp) => {
    const next = bp ? structuredClone(bp) : createDefaultBlueprint();
    const first = next.floors.at(0)!;
    set({
      blueprint: next,
      activeFloorId: first.id,
      selectedEnemyId: first.enemies.at(0)?.id ?? null,
      selectedChestId: null,
      selectedNpcId: null,
    });
  },

  setActiveFloor: (floorId) =>
    set({
      activeFloorId: floorId,
      selectedEnemyId: null,
      selectedChestId: null,
      selectedNpcId: null,
    }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  selectEnemy: (id) =>
    set({ selectedEnemyId: id, selectedChestId: null, selectedNpcId: null }),
  selectChest: (id) =>
    set({ selectedChestId: id, selectedEnemyId: null, selectedNpcId: null }),
  selectNpc: (id) =>
    set({ selectedNpcId: id, selectedEnemyId: null, selectedChestId: null }),
  updateMeta: (fields) =>
    set((s) => ({ blueprint: { ...s.blueprint, ...fields } })),

  setCustomSprite: (slot, sprite) =>
    set((s) => ({
      blueprint: {
        ...s.blueprint,
        customSprites: { ...(s.blueprint.customSprites ?? {}), [slot]: sprite },
      },
    })),

  addFloor: (maxFloors = 15) => {
    const { blueprint } = get();
    if (blueprint.floors.length >= maxFloors) return;
    const newFloor: RpgFloor = {
      id: `floor-${Date.now().toString(36)}`,
      name: `Floor ${blueprint.floors.length + 1}`,
      grid: createBlankGrid(10),
      enemies: [],
      chests: [],
      npcs: [],
      stairways: [],
    };
    set({
      blueprint: { ...blueprint, floors: [...blueprint.floors, newFloor] },
      activeFloorId: newFloor.id,
      selectedEnemyId: null,
      selectedChestId: null,
      selectedNpcId: null,
    });
  },

  renameFloor: (floorId, name) =>
    set((s) => ({
      blueprint: {
        ...s.blueprint,
        floors: s.blueprint.floors.map((f) =>
          f.id === floorId ? { ...f, name } : f,
        ),
      },
    })),

  resizeActiveFloor: (width, height) => {
    const { blueprint, activeFloorId } = get();
    const w = Math.max(8, Math.min(24, Math.floor(width)));
    const h = Math.max(8, Math.min(24, Math.floor(height)));
    const floors = blueprint.floors.map((f) =>
      f.id === activeFloorId ? resizeFloorGrid(f, w, h) : f,
    );
    const p = blueprint.player;
    const player =
      p.startFloorId === activeFloorId
        ? {
            ...p,
            startX: Math.min(w - 2, Math.max(1, p.startX)),
            startY: Math.min(h - 2, Math.max(1, p.startY)),
          }
        : p;
    set({ blueprint: { ...blueprint, player, floors } });
  },

  paintCell: (x, y) => {
    const s = get();
    const res = applyCellPaint(
      s.blueprint,
      s.activeFloorId,
      s.activeTool,
      x,
      y,
      {
        selectedEnemyId: s.selectedEnemyId,
        selectedChestId: s.selectedChestId,
        selectedNpcId: s.selectedNpcId,
      },
    );
    if (res) set(res);
  },

  updateEnemy: (enemyId, fields) =>
    set((s) => ({
      blueprint: {
        ...s.blueprint,
        floors: s.blueprint.floors.map((f) =>
          f.id !== s.activeFloorId
            ? f
            : {
                ...f,
                enemies: f.enemies.map((e) =>
                  e.id === enemyId ? { ...e, ...fields } : e,
                ),
              },
        ),
      },
    })),

  updateChest: (chestId, fields) =>
    set((s) => ({
      blueprint: {
        ...s.blueprint,
        floors: s.blueprint.floors.map((f) =>
          f.id !== s.activeFloorId
            ? f
            : {
                ...f,
                chests: (f.chests ?? []).map((c) =>
                  c.id === chestId ? { ...c, ...fields } : c,
                ),
              },
        ),
      },
    })),

  updateNpc: (npcId, fields) =>
    set((s) => ({
      blueprint: {
        ...s.blueprint,
        floors: s.blueprint.floors.map((f) =>
          f.id !== s.activeFloorId
            ? f
            : {
                ...f,
                npcs: (f.npcs ?? []).map((n) =>
                  n.id === npcId ? { ...n, ...fields } : n,
                ),
              },
        ),
      },
    })),

  setStairTarget: (fromX, fromY, toFloorId, toX, toY) =>
    set((s) => ({
      blueprint: {
        ...s.blueprint,
        floors: s.blueprint.floors.map((f) =>
          f.id !== s.activeFloorId
            ? f
            : {
                ...f,
                stairways: f.stairways.map((st) =>
                  st.from.x === fromX && st.from.y === fromY
                    ? { ...st, toFloorId, to: { x: toX, y: toY } }
                    : st,
                ),
              },
        ),
      },
    })),

  addHeroClass: (maxClasses = 6) => {
    const { blueprint } = get();
    const current = blueprint.classes ?? [];
    if (current.length >= maxClasses) return;
    const nextClass: RpgHeroClass = {
      id: `class-${Date.now().toString(36)}`,
      name: `Class ${current.length + 1}`,
      sprite: "⚔️",
      description: "Custom adventurer class.",
      combatType: "melee",
      range: 1,
      maxHp: 100,
      atk: 16,
      def: 5,
      element: "none",
      starterItems: [
        {
          itemType: "potion",
          itemName: "Healing Potion",
          value: 35,
          element: "none",
        },
      ],
    };
    set({ blueprint: { ...blueprint, classes: [...current, nextClass] } });
  },

  updateHeroClass: (classId, fields) =>
    set((s) => ({
      blueprint: {
        ...s.blueprint,
        classes: (s.blueprint.classes ?? []).map((c) =>
          c.id === classId ? { ...c, ...fields } : c,
        ),
      },
    })),

  removeHeroClass: (classId) =>
    set((s) => ({
      blueprint: {
        ...s.blueprint,
        classes: (s.blueprint.classes ?? []).filter((c) => c.id !== classId),
      },
    })),

  setClassStarterItems: (classId, starterItems) =>
    set((s) => ({
      blueprint: {
        ...s.blueprint,
        classes: (s.blueprint.classes ?? []).map((c) =>
          c.id === classId ? { ...c, starterItems } : c,
        ),
      },
    })),
  setFloorMusic: (track) => {
    const { blueprint, activeFloorId } = get();
    set({
      blueprint: {
        ...blueprint,
        floors: blueprint.floors.map((f) =>
          f.id === activeFloorId ? { ...f, musicTrack: track } : f,
        ),
      },
    });
  },
}));
