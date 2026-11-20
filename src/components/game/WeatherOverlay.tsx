"use client";

import type { FloorWeatherType } from "@/lib/rpg/schema";

const PARTICLES = [
  { left: "8%", top: "14%", delay: "0s" },
  { left: "22%", top: "62%", delay: "0.6s" },
  { left: "35%", top: "28%", delay: "1.2s" },
  { left: "49%", top: "75%", delay: "0.3s" },
  { left: "63%", top: "19%", delay: "1.5s" },
  { left: "77%", top: "54%", delay: "0.9s" },
  { left: "88%", top: "34%", delay: "1.8s" },
  { left: "15%", top: "82%", delay: "1.1s" },
  { left: "55%", top: "44%", delay: "0.4s" },
  { left: "82%", top: "78%", delay: "1.4s" },
];

export function WeatherOverlay({ weather }: { weather?: FloorWeatherType }) {
  if (!weather || weather === "none") return null;

  const glyph =
    weather === "embers"
      ? "🔥"
      : weather === "snow"
        ? "❄️"
        : weather === "spores"
          ? "🟢"
          : "✨";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-xl"
    >
      {PARTICLES.map((p, idx) => (
        <span
          key={idx}
          style={{ left: p.left, top: p.top, animationDelay: p.delay }}
          className="absolute animate-pulse text-xs opacity-60 select-none"
        >
          {glyph}
        </span>
      ))}
    </div>
  );
}
