"use client";

import { useSyncExternalStore } from "react";
import { isSfxMuted, playRetroSfx, setSfxMuted } from "@/lib/audio/retro-synth";
import { isMusicMuted, setMusicMuted } from "@/lib/audio/music-sequencer";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifyAll() {
  listeners.forEach((cb) => cb());
}

export function SoundToggleButton() {
  const sfxMuted = useSyncExternalStore(subscribe, isSfxMuted, () => false);
  const bgmMuted = useSyncExternalStore(subscribe, isMusicMuted, () => false);

  const toggleSfx = () => {
    const next = !sfxMuted;
    setSfxMuted(next);
    notifyAll();
    if (!next) playRetroSfx("chest");
  };

  const toggleMusic = () => {
    const next = !bgmMuted;
    setMusicMuted(next);
    notifyAll();
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggleMusic}
        title={bgmMuted ? "Unmute Chiptune Music" : "Mute Chiptune Music"}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
      >
        {bgmMuted ? "🎵 Off" : "🎵 Music"}
      </button>
      <button
        type="button"
        onClick={toggleSfx}
        title={sfxMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
      >
        {sfxMuted ? "🔇 SFX" : "🔊 SFX"}
      </button>
    </div>
  );
}
