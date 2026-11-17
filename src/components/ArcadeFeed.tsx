"use client";

import { useState } from "react";
import Link from "next/link";
import { GameCard, type GameCardData } from "./GameCard";

const DIFFICULTIES = ["All", "Easy", "Normal", "Hard"] as const;

export function ArcadeFeed({ games }: { games: GameCardData[] }) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("All");

  const filtered = games.filter((g) => {
    const matchesDiff = difficulty === "All" || g.difficulty === difficulty;
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.authorName.toLowerCase().includes(q);
    return matchesDiff && matchesQuery;
  });

  if (games.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
        <p className="text-lg font-semibold text-zinc-200">No dungeons uploaded yet</p>
        <p className="mt-1 text-sm text-zinc-400">
          Be the first creator to publish a JSON RPG to the arcade!
        </p>
        <Link
          href="/upload"
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          + Upload First RPG
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dungeons or creators..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none sm:max-w-xs"
        />

        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                difficulty === level
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-400">
          No dungeons match your current search or filter.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
