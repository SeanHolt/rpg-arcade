import type { LeaderboardRow } from "@/actions/leaderboards";

type Props = {
  title: string;
  rows: LeaderboardRow[];
  isEndless?: boolean;
};

export function LeaderboardCard({ title, rows, isEndless = false }: Props) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
        <span className="text-xs text-zinc-400">
          {isEndless ? "Ranked by Deepest Depth → Fewest Turns" : "Ranked by Fewest Turns"}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-400">
          No recorded victories yet. Be the first to claim #1!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2 pr-3">Player</th>
                <th className="py-2 pr-3">Hero &amp; Class</th>
                {isEndless && <th className="py-2 pr-3">Depth</th>}
                <th className="py-2 pr-3">Turns</th>
                <th className="py-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {rows.map((row, idx) => {
                const medal =
                  idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                return (
                  <tr key={row.id} className="text-zinc-200">
                    <td className="py-2.5 pr-3 font-bold">{medal}</td>
                    <td className="py-2.5 pr-3 font-semibold text-emerald-300">
                      {row.playerName}
                    </td>
                    <td className="py-2.5 pr-3 text-zinc-300">
                      {row.heroName}{" "}
                      <span className="text-zinc-500">
                        (Lv.{row.heroLevel} {row.heroClass})
                      </span>
                    </td>
                    {isEndless && (
                      <td className="py-2.5 pr-3 font-bold text-amber-300">
                        Depth {row.depthReached}
                      </td>
                    )}
                    <td className="py-2.5 pr-3 font-mono font-semibold text-zinc-100">
                      {row.turnsTaken}t
                    </td>
                    <td className="py-2.5 text-right text-zinc-500">{row.createdAtLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
