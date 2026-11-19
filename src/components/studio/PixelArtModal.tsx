"use client";

import { useEffect, useRef, useState } from "react";
import {
  createEmptyPixelGrid,
  flipGridHorizontal,
  flipGridVertical,
  floodFillGrid,
  GRID_DIM,
  renderGridToDataUrl,
  rotateGrid90,
} from "@/lib/rpg/pixel-tools";
import { PixelToolbar, type PixelTool } from "./PixelToolbar";

type Props = {
  title: string;
  initialSprite?: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
};

export function PixelArtModal({ title, initialSprite, onSave, onClose }: Props) {
  const [grid, setGrid] = useState<string[]>(() => createEmptyPixelGrid());
  const [undoStack, setUndoStack] = useState<string[][]>([]);
  const [redoStack, setRedoStack] = useState<string[][]>([]);
  const [tool, setTool] = useState<PixelTool>("pencil");
  const [color, setColor] = useState("#10b981");
  const [paletteId, setPaletteId] = useState("crypt");
  const [mirrorX, setMirrorX] = useState(false);
  const [mirrorY, setMirrorY] = useState(false);
  const isDrawingRef = useRef(false);
  const strokeSavedRef = useRef(false);

  useEffect(() => {
    if (!initialSprite?.startsWith("data:image/")) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = GRID_DIM;
      canvas.height = GRID_DIM;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, GRID_DIM, GRID_DIM);
      const data = ctx.getImageData(0, 0, GRID_DIM, GRID_DIM).data;
      const loaded = createEmptyPixelGrid();
      for (let i = 0; i < GRID_DIM * GRID_DIM; i++) {
        const a = data[i * 4 + 3];
        if (a > 20) {
          const hex = [0, 1, 2]
            .map((c) => data[i * 4 + c].toString(16).padStart(2, "0"))
            .join("");
          loaded[i] = `#${hex}`;
        }
      }
      setGrid(loaded);
    };
    img.src = initialSprite;
  }, [initialSprite]);

  const commitChange = (next: string[]) => {
    setUndoStack((prev) => [...prev.slice(-24), grid]);
    setRedoStack([]);
    setGrid(next);
  };

  const applyAtCell = (idx: number, isStart: boolean) => {
    if (tool === "eyedropper") {
      const picked = grid[idx];
      if (picked) setColor(picked);
      setTool("pencil");
      return;
    }

    const paintVal = tool === "eraser" ? "" : color;
    if (tool === "fill") {
      if (isStart) commitChange(floodFillGrid(grid, idx, paintVal));
      return;
    }

    if (isStart && !strokeSavedRef.current) {
      setUndoStack((prev) => [...prev.slice(-24), grid]);
      setRedoStack([]);
      strokeSavedRef.current = true;
    }

    const x = idx % GRID_DIM;
    const y = Math.floor(idx / GRID_DIM);
    const targets = new Set<number>([idx]);
    if (mirrorX) targets.add(y * GRID_DIM + (GRID_DIM - 1 - x));
    if (mirrorY) targets.add((GRID_DIM - 1 - y) * GRID_DIM + x);
    if (mirrorX && mirrorY) {
      targets.add((GRID_DIM - 1 - y) * GRID_DIM + (GRID_DIM - 1 - x));
    }

    setGrid((prev) => {
      const next = [...prev];
      targets.forEach((t) => {
        next[t] = paintVal;
      });
      return next;
    });
  };

  const handleUploadPng = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = GRID_DIM;
      canvas.height = GRID_DIM;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, GRID_DIM, GRID_DIM);
      onSave(canvas.toDataURL("image/png"));
      onClose();
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div
      onMouseUp={() => {
        isDrawingRef.current = false;
        strokeSavedRef.current = false;
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg space-y-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-100">🎨 16×16 Pixel Studio — {title}</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <PixelToolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          paletteId={paletteId}
          setPaletteId={setPaletteId}
          mirrorX={mirrorX}
          setMirrorX={setMirrorX}
          mirrorY={mirrorY}
          setMirrorY={setMirrorY}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={() => {
            const last = undoStack.at(-1);
            if (!last) return;
            setRedoStack((r) => [...r, grid]);
            setUndoStack((u) => u.slice(0, -1));
            setGrid(last);
          }}
          onRedo={() => {
            const next = redoStack.at(-1);
            if (!next) return;
            setUndoStack((u) => [...u, grid]);
            setRedoStack((r) => r.slice(0, -1));
            setGrid(next);
          }}
          onFlipH={() => commitChange(flipGridHorizontal(grid))}
          onFlipV={() => commitChange(flipGridVertical(grid))}
          onRotate={() => commitChange(rotateGrid90(grid))}
          onClear={() => commitChange(createEmptyPixelGrid())}
        />

        <div className="flex justify-center">
          <div
            className="grid select-none border border-zinc-700 bg-zinc-950"
            style={{ gridTemplateColumns: `repeat(${GRID_DIM}, 18px)` }}
          >
            {grid.map((hex, idx) => (
              <div
                key={idx}
                onMouseDown={() => {
                  isDrawingRef.current = true;
                  applyAtCell(idx, true);
                }}
                onMouseEnter={() => {
                  if (isDrawingRef.current) applyAtCell(idx, false);
                }}
                style={{ backgroundColor: hex || undefined }}
                className="h-[18px] w-[18px] cursor-crosshair border-[0.5px] border-zinc-800/70"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3 text-xs">
          <label className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-300 hover:bg-zinc-800">
            📁 Upload PNG
            <input type="file" accept="image/*" onChange={handleUploadPng} className="hidden" />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-3.5 py-2 text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(renderGridToDataUrl(grid));
                onClose();
              }}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
            >
              Save Sprite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
