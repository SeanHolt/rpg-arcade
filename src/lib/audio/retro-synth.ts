export type RetroSfxName =
  | "step"
  | "hit"
  | "ranged"
  | "skill"
  | "chest"
  | "potion"
  | "shrine"
  | "levelup"
  | "victory"
  | "defeat";

const MUTE_STORAGE_KEY = "rpg-arcade-sfx-muted";
let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedCtx) {
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === "suspended") {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

export function isSfxMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_STORAGE_KEY) === "1";
}

export function setSfxMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = "square",
  gainPeak = 0.08
) {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(gainPeak, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playRetroSfx(name: RetroSfxName): void {
  if (isSfxMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  switch (name) {
    case "step":
      playTone(ctx, 165, 0, 0.045, "triangle", 0.05);
      break;
    case "hit":
      playTone(ctx, 190, 0, 0.06, "sawtooth", 0.09);
      playTone(ctx, 110, 0.05, 0.08, "square", 0.08);
      break;
    case "ranged":
      playTone(ctx, 660, 0, 0.05, "square", 0.06);
      playTone(ctx, 440, 0.04, 0.07, "triangle", 0.06);
      break;
    case "skill":
      playTone(ctx, 330, 0, 0.06, "square", 0.08);
      playTone(ctx, 494, 0.05, 0.06, "square", 0.08);
      playTone(ctx, 740, 0.1, 0.12, "sawtooth", 0.08);
      break;
    case "chest":
      playTone(ctx, 523.25, 0, 0.07, "square", 0.07);
      playTone(ctx, 659.25, 0.06, 0.07, "square", 0.07);
      playTone(ctx, 783.99, 0.12, 0.14, "square", 0.08);
      break;
    case "potion":
      playTone(ctx, 392, 0, 0.07, "triangle", 0.08);
      playTone(ctx, 587.33, 0.06, 0.11, "triangle", 0.08);
      break;
    case "shrine":
      playTone(ctx, 440, 0, 0.09, "triangle", 0.08);
      playTone(ctx, 554.37, 0.08, 0.09, "triangle", 0.08);
      playTone(ctx, 659.25, 0.16, 0.16, "triangle", 0.08);
      break;
    case "levelup":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) =>
        playTone(ctx, f, idx * 0.07, 0.12, "square", 0.08)
      );
      break;
    case "victory":
      [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, idx) =>
        playTone(ctx, f, idx * 0.09, idx === 5 ? 0.26 : 0.09, "square", 0.09)
      );
      break;
    case "defeat":
      [330, 293.66, 261.63, 196].forEach((f, idx) =>
        playTone(ctx, f, idx * 0.12, idx === 3 ? 0.3 : 0.12, "sawtooth", 0.08)
      );
      break;
  }
}
