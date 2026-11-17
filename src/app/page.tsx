import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type HomePageProps = {
  searchParams: Promise<{ feed?: string }>;
};

async function GameFeed({ searchParams }: HomePageProps) {
  await connection();
  const [session, { feed }] = await Promise.all([auth(), searchParams]);
  const userId = session?.user?.id;
  const isFollowingTab = feed === "following" && Boolean(userId);

  const games = await prisma.game.findMany({
    where: {
      isPublic: true,
      ...(isFollowingTab
        ? { author: { followers: { some: { followerId: userId } } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { upvotes: true, comments: true } },
    },
  });

  return (
    <div className="space-y-6">
      {userId && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              !isFollowingTab
                ? "bg-emerald-600 text-white"
                : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            🌐 All Dungeons
          </Link>
          <Link
            href="/?feed=following"
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              isFollowingTab
                ? "bg-emerald-600 text-white"
                : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            ★ Following Creators
          </Link>
        </div>
      )}

      {games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-sm text-zinc-400">
          {isFollowingTab
            ? "No dungeons found from creators you follow yet. Follow creators from any dungeon page!"
            : "No public dungeons yet. Open the Studio to build the first one!"}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <article
              key={game.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-bold text-zinc-100">{game.title}</h2>
                  <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
                    {game.difficulty}
                  </span>
                </div>

                <p className="mt-1 text-xs text-zinc-400">
                  By{" "}
                  <Link
                    href={`/creator/${game.author.id}`}
                    className="font-medium text-zinc-200 hover:text-emerald-400 hover:underline"
                  >
                    {game.author.name ?? "Anonymous Creator"}
                  </Link>
                </p>

                <p className="mt-3 line-clamp-2 text-xs text-zinc-400">{game.description}</p>
              </div>

              <div className="mt-5 border-t border-zinc-800 pt-3">
                <div className="mb-3 flex justify-between text-xs text-zinc-500">
                  <span>
                    ▲ {game._count.upvotes} • 💬 {game._count.comments}
                  </span>
                  <span>{game.playCount} plays</span>
                </div>

                <Link
                  href={`/play/${game.id}`}
                  className="block w-full rounded-lg bg-emerald-600 py-2 text-center text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Play Dungeon
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">2D Web RPG Arcade</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Play community-built dungeons, descend the Endless Abyss, or craft your own RPG in Visual Studio.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/endless"
            className="rounded-xl border border-amber-700/60 bg-amber-950/60 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/60"
          >
            ♾️ Endless Mode
          </Link>
          <Link
            href="/studio"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            + Create Dungeon
          </Link>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-52 animate-pulse rounded-xl bg-zinc-900" />
            ))}
          </div>
        }
      >
        <GameFeed searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
