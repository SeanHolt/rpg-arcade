import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RpgBlueprintSchema } from "@/lib/rpg/schema";
import { getUserOwnedPacks } from "@/lib/rpg/load-owned-packs";
import { DungeonStudio } from "@/components/studio/DungeonStudio";

type EditPageProps = { params: Promise<{ id: string }> };

async function EditStudioLoader({ params }: EditPageProps) {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const [game, ownedPacks] = await Promise.all([
    prisma.game.findUnique({ where: { id } }),
    getUserOwnedPacks(session.user.id),
  ]);

  if (!game || game.authorId !== session.user.id) notFound();

  const parsed = RpgBlueprintSchema.safeParse(JSON.parse(game.gameData));
  if (!parsed.success) notFound();

  return (
    <DungeonStudio
      gameId={game.id}
      initialBlueprint={parsed.data}
      initialIsPublic={game.isPublic}
      ownedPacks={ownedPacks}
    />
  );
}

export default function EditStudioPage({ params }: EditPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Edit Dungeon</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-zinc-900" />}>
        <EditStudioLoader params={params} />
      </Suspense>
    </main>
  );
}
