import Link from "next/link";

export type GameCardData = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  floorCount: number;
  playCount: number;
  authorName: string;
};

export function GameCard({ game }: { game: GameCardData }) {
  const badgeColor =
    game.difficulty === "Hard"
      ? "border-red-800 bg-red-950/70 text-red-300"
      : game.difficulty === "Easy"
        ? "border-emerald-800 bg-emerald-950/70 text-emerald-300"
        : "border-amber-800 bg-amber-950/70 text-amber-300";

  return (
    <article className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:border-zinc-700">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-zinc-100">{game.title}</h2>
          <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${badgeColor}`}>
            {game.difficulty}
          </span>
        </div>

        <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{game.description}</p>
      </div>

      <div className="mt-5 border-t border-zinc-800 pt-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>By {game.authorName}</span>
          <span>
            {game.floorCount} {game.floorCount === 1 ? "Floor" : "Floors"} • {game.playCount}{" "}
            {game.playCount === 1 ? "Play" : "Plays"}
          </span>
        </div>

        <Link
          href={`/play/${game.id}`}
          className="mt-3 block w-full rounded-lg bg-emerald-600 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-500"
        >
          ▶ Play Dungeon
        </Link>
      </div>
    </article>
  );
}
