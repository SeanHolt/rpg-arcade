import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserOwnedPacks } from "@/lib/rpg/load-owned-packs";
import { DungeonStudio } from "@/components/studio/DungeonStudio";

async function StudioAuthGate() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, ownedPacks] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { isPro: true } }),
    getUserOwnedPacks(session.user.id),
  ]);

  return <DungeonStudio ownedPacks={ownedPacks} isPro={Boolean(user?.isPro)} />;
}

export default function StudioPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Visual Dungeon Studio</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-zinc-900" />}>
        <StudioAuthGate />
      </Suspense>
    </main>
  );
}
