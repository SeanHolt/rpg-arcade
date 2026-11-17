"use client";

import { useSyncExternalStore } from "react";
import { isSfxMuted, playRetroSfx, setSfxMuted } from "@/lib/audio/retro-synth";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function SoundToggleButton() {
  const muted = useSyncExternalStore(subscribe, isSfxMuted, () => false);

  const toggle = () => {
    const next = !muted;
    setSfxMuted(next);
    listeners.forEach((cb) => cb());
    if (!next) {
      playRetroSfx("chest");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={muted ? "Unmute 8-Bit Sound Effects" : "Mute 8-Bit Sound Effects"}
      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
    >
      {muted ? "🔇 Muted" : "🔊 SFX On"}
    </button>
  );
}
