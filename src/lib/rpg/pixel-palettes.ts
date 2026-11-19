export type RetroPalette = {
  id: string;
  label: string;
  colors: string[];
};

export const RETRO_PALETTES: RetroPalette[] = [
  {
    id: "crypt",
    label: "💀 Dungeon Crypt",
    colors: [
      "#09090b",
      "#27272a",
      "#52525b",
      "#a1a1aa",
      "#e4e4e7",
      "#10b981",
      "#f59e0b",
      "#ef4444",
    ],
  },
  {
    id: "gameboy",
    label: "🟩 Game Boy 4-Shade",
    colors: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
  },
  {
    id: "nes",
    label: "🕹️ NES Classic",
    colors: [
      "#000000",
      "#fcfcfc",
      "#f83800",
      "#ffa044",
      "#00a800",
      "#0078f8",
      "#940084",
      "#7c7c7c",
    ],
  },
  {
    id: "magma",
    label: "🔥 Magma Forge",
    colors: [
      "#1c1917",
      "#44403c",
      "#7f1d1d",
      "#dc2626",
      "#f97316",
      "#facc15",
      "#fef08a",
      "#a8a29e",
    ],
  },
  {
    id: "pirate",
    label: "🏴‍☠️ Pirate Cove",
    colors: [
      "#1e1b18",
      "#78350f",
      "#b45309",
      "#fbbf24",
      "#0369a1",
      "#38bdf8",
      "#15803d",
      "#f8fafc",
    ],
  },
];
