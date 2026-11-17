import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RpgBlueprintSchema } from "@/lib/rpg/schema";
import { RpgPlayer } from "@/components/game/RpgPlayer";
import { auth } from "@/auth";
import { CommunitySection } from "@/components/game/CommunitySection";
import { getFeatureFlags } from "@/lib/feature-flags";

type PlayPageProps = {
  params: Promise<{ id: string }>;
};

async function PlayableGameLoader({ params }: PlayPageProps) {
  const { id } = await params;
  const flags = await getFeatureFlags();
  const session = await auth();
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      _count: { select: { upvotes: true } },
      upvotes: session?.user?.id
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!game || (!game.isPublic && game.authorId !== session?.user?.id)) {
    notFound();
  }
  const existingSave = session?.user?.id
    ? await prisma.gameSave.findUnique({
        where: { userId_gameId: { userId: session.user.id, gameId: game.id } },
        select: { floorName: true, heroLevel: true, stateJson: true, updatedAt: true },
      })
    : null;
  await prisma.game.update({
    where: { id },
    data: { playCount: { increment: 1 } },
  });

  const parsed = RpgBlueprintSchema.safeParse(JSON.parse(game.gameData));
  if (!parsed.success) {
    notFound();
  }

   return (
    <>
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
      <CommunitySection
        gameId={game.id}
        currentUserId={session?.user?.id}
        upvoteCount={game._count.upvotes}
        hasUpvoted={Array.isArray(game.upvotes) && game.upvotes.length > 0}
        comments={game.comments.map((c) => ({
          id: c.id,
          content: c.content,
          authorName: c.user.name ?? "Player",
          userId: c.userId,
          createdAtLabel: c.createdAt.toLocaleDateString(),
        }))}
      />
    </>
  );
}

export default function PlayPage({ params }: PlayPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
        }
      >
        <PlayableGameLoader params={params} />
      </Suspense>
    </main>
  );
}
