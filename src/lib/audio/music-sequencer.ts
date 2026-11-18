import type { RpgFloorMusic } from "@/lib/rpg/schema";
import { NOTE_FREQUENCIES } from "./music-presets";

const BGM_MUTE_KEY = "rpg-arcade-bgm-muted";

let bgmCtx: AudioContext | null = null;
let loopTimer: ReturnType<typeof setInterval> | null = null;
let stepIdx = 0;
let activeTrack: RpgFloorMusic | null = null;

function getBgmContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!bgmCtx) bgmCtx = new AudioCtx();
  if (bgmCtx.state === "suspended") {
    bgmCtx.resume().catch(() => {});
  }
  return bgmCtx;
}

export function isMusicMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BGM_MUTE_KEY) === "1";
}

export function setMusicMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BGM_MUTE_KEY, muted ? "1" : "0");
  if (muted) {
    stopBgMusic(false);
  } else if (activeTrack) {
    startBgMusic(activeTrack);
  }
}

function playStepNote(track: RpgFloorMusic, noteIndex: number) {
  if (isMusicMuted()) return;
  const ctx = getBgmContext();
  if (!ctx) return;

  const note = track.notes[noteIndex % track.notes.length];
  const freq = NOTE_FREQUENCIES[note];
  if (!freq) return;

  const stepSec = 60 / track.tempoBpm / 2;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = track.waveform;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.032, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + stepSec * 0.9);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + stepSec);
}

export function startBgMusic(track: RpgFloorMusic): void {
  activeTrack = track;
  stopBgMusic(false);
  if (isMusicMuted()) return;

  stepIdx = 0;
  const intervalMs = Math.round((60 / track.tempoBpm / 2) * 1000);
  playStepNote(track, stepIdx);
  stepIdx = (stepIdx + 1) % 8;

  loopTimer = setInterval(() => {
    if (!activeTrack || isMusicMuted()) return;
    playStepNote(activeTrack, stepIdx);
    stepIdx = (stepIdx + 1) % 8;
  }, intervalMs);
}

export function stopBgMusic(clearTrack = true): void {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
  if (clearTrack) {
    activeTrack = null;
  }
}
