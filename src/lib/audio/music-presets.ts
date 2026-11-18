import type { RpgFloorMusic, RpgMusicNote } from "@/lib/rpg/schema";
import type { ThemeId } from "@/lib/rpg/themes";

export const NOTE_OPTIONS: RpgMusicNote[] = [
  "REST",
  "C3",
  "D3",
  "E3",
  "F3",
  "G3",
  "A3",
  "B3",
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
];

export const NOTE_FREQUENCIES: Record<RpgMusicNote, number> = {
  REST: 0,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
};

export const THEME_MUSIC_PRESETS: Record<ThemeId, RpgFloorMusic> = {
  crypt: {
    tempoBpm: 105,
    waveform: "triangle",
    notes: ["A3", "C4", "E4", "D4", "C4", "B3", "A3", "REST"],
  },
  scifi: {
    tempoBpm: 136,
    waveform: "square",
    notes: ["E3", "E4", "B3", "G3", "E3", "D4", "B3", "G3"],
  },
  pirate: {
    tempoBpm: 130,
    waveform: "triangle",
    notes: ["D4", "F4", "A4", "G4", "F4", "D4", "C4", "D4"],
  },
  magma: {
    tempoBpm: 144,
    waveform: "sawtooth",
    notes: ["C3", "C3", "D3", "E3", "C3", "G3", "F3", "E3"],
  },
};
