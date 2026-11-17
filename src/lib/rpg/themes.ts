export type ThemeId = "crypt" | "scifi" | "pirate" | "magma";

export type DungeonTheme = {
  id: ThemeId;
  label: string;
  wallBg: string;
  floorBg: string;
  stairsBg: string;
  shrineBg: string;
  stairsIcon: string;
  shrineIcon: string;
  chestIcon: string;
};

export const DUNGEON_THEMES: Record<ThemeId, DungeonTheme> = {
  crypt: {
    id: "crypt",
    label: "🏰 Classic Crypt",
    wallBg: "bg-zinc-700/85 border border-zinc-600/40",
    floorBg: "bg-zinc-900/90",
    stairsBg: "bg-amber-950/60 border border-amber-700/40",
    shrineBg: "bg-emerald-950/60 border border-emerald-700/40",
    stairsIcon: "🪜",
    shrineIcon: "✨",
    chestIcon: "📦",
  },
  scifi: {
    id: "scifi",
    label: "🚀 Sci-Fi Station",
    wallBg: "bg-slate-700/90 border border-cyan-500/30",
    floorBg: "bg-slate-950/95",
    stairsBg: "bg-cyan-950/70 border border-cyan-500/40",
    shrineBg: "bg-teal-950/70 border border-teal-400/40",
    stairsIcon: "🌀",
    shrineIcon: "🔋",
    chestIcon: "🧰",
  },
  pirate: {
    id: "pirate",
    label: "🏴‍☠️ Pirate Cove",
    wallBg: "bg-amber-900/80 border border-amber-700/40",
    floorBg: "bg-stone-900/90",
    stairsBg: "bg-sky-950/70 border border-sky-600/40",
    shrineBg: "bg-lime-950/60 border border-lime-600/40",
    stairsIcon: "⛵",
    shrineIcon: "🌴",
    chestIcon: "💰",
  },
  magma: {
    id: "magma",
    label: "🌋 Magma Cavern",
    wallBg: "bg-stone-800/95 border border-orange-600/40",
    floorBg: "bg-red-950/40",
    stairsBg: "bg-orange-950/80 border border-orange-500/50",
    shrineBg: "bg-indigo-950/70 border border-indigo-400/40",
    stairsIcon: "🕳️",
    shrineIcon: "💎",
    chestIcon: "⚱️",
  },
};
