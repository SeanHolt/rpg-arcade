"use client";

import { useState } from "react";

type Props = {
  title: string;
  initialSprite?: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
};

const PALETTE = [
  "#000000", "#ffffff", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#06b6d4", "#3b82f6",
  "#a855f7", "#ec4899", "#78350f", "#71717a",
];

export function PixelArtModal({ title, onSave, onClose }: Props) {
  const [pixels, setPixels] = useState<string[]>(() => Array(256).fill(""));
  const [color, setColor] = useState<string>("#22c55e");
  const [isDrawing, setIsDrawing] = useState(false);

  const paintPixel = (idx: number, erase = false) => {
    setPixels((prev) => {
      const next = [...prev];
      next[idx] = erase ? "" : color;
      return next;
    });
  };

  const exportCanvasDataUrl = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    pixels.forEach((hex, idx) => {
      if (!hex) return;
      ctx.fillStyle = hex;
      ctx.fillRect(idx % 16, Math.floor(idx / 16), 1, 1);
    });

    onSave(canvas.toDataURL("image/png"));
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, 16, 16);
        onSave(canvas.toDataURL("image/png"));
        onClose();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-100">🎨 Pixel Art Studio: {title}</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* 16x16 Drawing Grid */}
        <div
          onMouseLeave={() => setIsDrawing(false)}
          className="mx-auto grid w-fit grid-cols-16 gap-px rounded-lg border border-zinc-700 bg-zinc-800 p-1"
          style={{ gridTemplateColumns: "repeat(16, 1.15rem)" }}
        >
          {pixels.map((hex, idx) => (
            <div
              key={idx}
              onMouseDown={() => {
                setIsDrawing(true);
                paintPixel(idx);
              }}
              onMouseEnter={() => {
                if (isDrawing) paintPixel(idx);
              }}
              onMouseUp={() => setIsDrawing(false)}
              onContextMenu={(e) => {
                e.preventDefault();
                paintPixel(idx, true);
              }}
              style={{ backgroundColor: hex || "#18181b" }}
              className="h-4 w-4 cursor-crosshair"
            />
          ))}
        </div>

        {/* Color Swatches */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {PALETTE.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              style={{ backgroundColor: swatch }}
              className={`h-6 w-6 rounded-full border-2 ${
                color === swatch ? "scale-110 border-white" : "border-zinc-700"
              }`}
            />
          ))}
          <button
            type="button"
            onClick={() => setColor("")}
            className={`rounded border px-2 py-1 text-xs ${
              color === "" ? "border-emerald-400 text-emerald-300" : "border-zinc-700 text-zinc-400"
            }`}
          >
            Eraser
          </button>
          <button
            type="button"
            onClick={() => setPixels(Array(256).fill(""))}
            className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:text-white"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-4">
          <label className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700">
            📁 Upload PNG/JPG
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={exportCanvasDataUrl}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            Use Pixel Sprite
          </button>
        </div>
      </div>
    </div>
  );
}
