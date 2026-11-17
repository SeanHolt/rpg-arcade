import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PackSpritesPayloadSchema } from "@/lib/rpg/pack-schema";
import { SpriteDisplay } from "@/components/game/SpriteDisplay";
import { FollowButton } from "@/components/social/FollowButton";

type CreatorPageProps = { params: Promise<{ id: string }> };

async function CreatorProfileLoader({ params }: CreatorPageProps) {
  await connection();
  const [{ id }, session] = await Promise.all([params, auth()]);
  const viewerId = session?.user?.id;

  const creator = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { followers: true } },
      followers: viewerId ? { where: { followerId: viewerId }, select: { id: true } } : false,
      games: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { upvotes: true, comments: true } } },
      },
      assetPacks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!creator) notFound();

  const totalPlays = creator.games.reduce((sum, g) => sum + g.playCount, 0);
  const totalUpvotes = creator.games.reduce((sum, g) => sum + g._count.upvotes, 0);
  const isSelf = viewerId === creator.id;
  const isFollowing = Array.isArray(creator.followers) && creator.followers.length > 0;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            {creator.name ?? "Dungeon Creator"}
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Joined {creator.createdAt.toLocaleDateString()} • {creator.games.length} Dungeons •{" "}
            {totalPlays} Plays • ▲ {totalUpvotes} Upvotes
          </p>
        </div>

        {!isSelf && (
          <FollowButton
            creatorId={creator.id}
            initialFollowing={isFollowing}
            initialCount={creator._count.followers}
            disabled={!viewerId}
          />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100">
          Published Dungeons ({creator.games.length})
        </h2>
        {creator.games.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-400">
            No public dungeons published yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creator.games.map((game) => (
              <article
                key={game.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-zinc-100">{game.title}</h3>
                    <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
                      {game.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{game.description}</p>
                </div>

                <div className="mt-4 border-t border-zinc-800 pt-3">
                  <div className="mb-3 flex justify-between text-xs text-zinc-500">
                    <span>▲ {game._count.upvotes} • 💬 {game._count.comments}</span>
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
      </section>

      {creator.assetPacks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-100">
              Asset Packs ({creator.assetPacks.length})
            </h2>
            <Link href="/marketplace" className="text-xs text-emerald-400 hover:underline">
              View in Asset Store →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creator.assetPacks.map((pack) => {
              const parsed = PackSpritesPayloadSchema.safeParse(JSON.parse(pack.spritesJson));
              return (
                <div
                  key={pack.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-zinc-100">
                    <span>{pack.title}</span>
                    <span className="text-amber-300">
                      {pack.price === 0 ? "FREE" : `🪙 ${pack.price}`}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-400">{pack.description}</p>
                  {parsed.success && (
                    <div className="mt-3 flex flex-wrap gap-1.5 rounded bg-zinc-950 p-2">
                      {Object.values(parsed.data.tiles)
                        .filter(Boolean)
                        .map((url, idx) => (
                          <SpriteDisplay key={idx} sprite={url!} sizeClass="h-5 w-5" />
                        ))}
                      {parsed.data.entities.map((ent, idx) => (
                        <SpriteDisplay key={idx} sprite={ent.sprite} sizeClass="h-5 w-5" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default function CreatorProfilePage({ params }: CreatorPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-zinc-900" />}>
        <CreatorProfileLoader params={params} />
      </Suspense>
    </main>
  );
}
