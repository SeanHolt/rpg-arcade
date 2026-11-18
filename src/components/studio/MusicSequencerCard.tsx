"use client";

import { useEffect, useState } from "react";
import type { RpgFloorMusic, RpgMusicNote } from "@/lib/rpg/schema";
import type { ThemeId } from "@/lib/rpg/themes";
import { NOTE_OPTIONS, THEME_MUSIC_PRESETS } from "@/lib/audio/music-presets";
import { startBgMusic, stopBgMusic } from "@/lib/audio/music-sequencer";

type Props = {
  floorName: string;
  themeId?: ThemeId;
  musicTrack?: RpgFloorMusic;
  onChange: (track?: RpgFloorMusic) => void;
};

export function MusicSequencerCard({ floorName, themeId = "crypt", musicTrack, onChange }: Props) {
  const [previewing, setPreviewing] = useState(false);
  const activeTrack = musicTrack ?? THEME_MUSIC_PRESETS[themeId];

  useEffect(() => {
    return () => stopBgMusic();
  }, []);

  const togglePreview = () => {
    if (previewing) {
      stopBgMusic();
      setPreviewing(false);
    } else {
      startBgMusic(activeTrack);
      setPreviewing(true);
    }
  };

  const updateTrack = (next: RpgFloorMusic) => {
    onChange(next);
    if (previewing) startBgMusic(next);
  };

  return (
    <div className="space-y-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold uppercase text-zinc-300">
          🎵 Floor Chiptune ({floorName})
        </span>
        <button
          type="button"
          onClick={togglePreview}
          className={`rounded-lg px-2.5 py-1 font-semibold ${
            previewing
              ? "bg-amber-600 text-white"
              : "border border-emerald-700 bg-emerald-950/60 text-emerald-300"
          }`}
        >
          {previewing ? "⏹ Stop" : "▶ Preview"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label>
          Tempo (BPM)
          <input
            type="number"
            min={70}
            max={200}
            value={activeTrack.tempoBpm}
            onChange={(e) =>
              updateTrack({
                ...activeTrack,
                tempoBpm: Math.min(200, Math.max(70, Number(e.target.value) || 120)),
              })
            }
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        </label>

        <label>
          Synth Wave
          <select
            value={activeTrack.waveform}
            onChange={(e) =>
              updateTrack({
                ...activeTrack,
                waveform: e.target.value as RpgFloorMusic["waveform"],
              })
            }
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
          >
            <option value="triangle">Triangle (Warm)</option>
            <option value="square">Square (Classic 8-Bit)</option>
            <option value="sawtooth">Sawtooth (Boss Grit)</option>
          </select>
        </label>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-zinc-400">
          <span>8-Step Melody Loop</span>
          <button
            type="button"
            onClick={() => updateTrack({ ...THEME_MUSIC_PRESETS[themeId] })}
            className="text-emerald-400 hover:underline"
          >
            Reset to Theme Preset
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {activeTrack.notes.map((note, idx) => (
            <select
              key={idx}
              value={note}
              onChange={(e) =>
                updateTrack({
                  ...activeTrack,
                  notes: activeTrack.notes.map((n, i) =>
                    i === idx ? (e.target.value as RpgMusicNote) : n
                  ),
                })
              }
              className="rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1 font-mono text-center text-emerald-300"
            >
              {NOTE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>
    </div>
  );
}
