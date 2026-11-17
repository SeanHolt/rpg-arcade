"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteUserGame, toggleGameVisibility } from "@/actions/creator";

export type CreatorGameItem = {
  id: string;
  title: string;
  difficulty: string;
  floorCount: number;
  playCount: number;
  isPublic: boolean;
};

export function CreatorGameCard({ game }: { game: CreatorGameItem }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleGameVisibility(game.id);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${game.title}" permanently?`)) return;
    startTransition(async () => {
      await deleteUserGame(game.id);
    });
  };

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-zinc-100">{game.title}</h2>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              game.isPublic
                ? "border-emerald-800 bg-emerald-950/70 text-emerald-300"
                : "border-zinc-700 bg-zinc-800 text-zinc-400"
            }`}
          >
            {game.isPublic ? "Public" : "Private Draft"}
          </span>
        </div>

        <p className="mt-1 text-xs text-zinc-400">
          {game.difficulty} • {game.floorCount}{" "}
          {game.floorCount === 1 ? "Floor" : "Floors"} • {game.playCount} Plays
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Link
          href={`/play/${game.id}`}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-medium text-zinc-200 hover:bg-zinc-700"
        >
          ▶ Play
        </Link>

        <Link
          href={`/studio/${game.id}`}
          className="rounded-lg border border-emerald-800 bg-emerald-950/60 px-3 py-1.5 font-medium text-emerald-300 hover:bg-emerald-900/60"
        >
          ✏️ Edit
        </Link>

        <button
          type="button"
          disabled={isPending}
          onClick={handleToggle}
          className="rounded-lg border border-amber-800/70 bg-amber-950/50 px-3 py-1.5 font-medium text-amber-200 hover:bg-amber-900/50 disabled:opacity-50"
        >
          {game.isPublic ? "Make Private" : "Publish"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="rounded-lg border border-red-900/70 bg-red-950/50 px-3 py-1.5 font-medium text-red-300 hover:bg-red-900/50 disabled:opacity-50"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
