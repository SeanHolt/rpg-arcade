import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RpgBlueprintSchema } from "@/lib/rpg/schema";
import { getFeatureFlags } from "@/lib/feature-flags";
import { getDungeonLeaderboard } from "@/actions/leaderboards";
import { RpgPlayer } from "@/components/game/RpgPlayer";
import { CommunitySection } from "@/components/game/CommunitySection";
import { LeaderboardCard } from "@/components/game/LeaderboardCard";

type PlayPageProps = { params: Promise<{ id: string }> };

async function PlayGameLoader({ params }: PlayPageProps) {
    await connection();
    const [{ id }, session, flags] = await Promise.all([params, auth(), getFeatureFlags()]);
    const userId = session?.user?.id;

    const game = await prisma.game.findUnique({
        where: { id },
        include: {
            author: { select: { id: true, name: true } },
            _count: { select: { upvotes: true } },
            upvotes: userId ? { where: { userId }, select: { id: true } } : false,
            comments: {
                orderBy: { createdAt: "desc" },
                include: { user: { select: { name: true } } },
            },
        },
    });

    if (!game) notFound();
    if (!game.isPublic && game.authorId !== userId) notFound();

    const parsed = RpgBlueprintSchema.safeParse(JSON.parse(game.gameData));
    if (!parsed.success) notFound();

    await prisma.game.update({
        where: { id: game.id },
        data: { playCount: { increment: 1 } },
    });

    const [existingSave, leaderboard] = await Promise.all([
        userId
            ? prisma.gameSave.findUnique({
                where: { userId_gameId: { userId, gameId: game.id } },
                select: { floorName: true, heroLevel: true, stateJson: true, updatedAt: true },
            })
            : null,
        flags.leaderboards_enabled ? getDungeonLeaderboard(game.id) : Promise.resolve([]),
    ]);

    return (
        <div className="space-y-8">
            <RpgPlayer
                gameId={game.id}
                blueprint={parsed.data}
                authorName={game.author.name ?? "Anonymous Creator"}
                flags={flags}
                savedRun={
                    existingSave
                        ? {
                            floorName: existingSave.floorName,
                            heroLevel: existingSave.heroLevel,
                            updatedAtLabel: existingSave.updatedAt.toLocaleString(),
                            snapshot: JSON.parse(existingSave.stateJson),
                        }
                        : undefined
                }
            />

            {flags.leaderboards_enabled && (
                <LeaderboardCard title="🏆 Top 10 Speedruns" rows={leaderboard} />
            )}

            <CommunitySection
                gameId={game.id}
                currentUserId={userId}
                upvoteCount={game._count.upvotes}
                hasUpvoted={Array.isArray(game.upvotes) && game.upvotes.length > 0}
                comments={game.comments.map((c) => ({
                    id: c.id,
                    content: c.content,
                    createdAtLabel: c.createdAt.toLocaleDateString(),
                    userId: c.userId,
                    authorName: c.user.name ?? "Player",
                }))}
            />

        </div>
    );
}

export default function PlayGamePage({ params }: PlayPageProps) {
    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-zinc-900" />}>
                <PlayGameLoader params={params} />
            </Suspense>
        </main>
    );
}
