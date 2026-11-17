import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EndlessClientShell } from "@/components/game/EndlessClientShell";
import type { SavedRunData } from "@/components/game/SaveRunControls";

async function EndlessLoader() {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  const dbSave = userId
    ? await prisma.endlessSave.findUnique({
        where: { userId },
        select: { floorName: true, heroLevel: true, stateJson: true, updatedAt: true },
      })
    : null;

  const cloudSave: SavedRunData | undefined = dbSave
    ? {
        floorName: dbSave.floorName,
        heroLevel: dbSave.heroLevel,
        updatedAtLabel: dbSave.updatedAt.toLocaleString(),
        snapshot: JSON.parse(dbSave.stateJson),
      }
    : undefined;

  return <EndlessClientShell isLoggedIn={Boolean(userId)} cloudSave={cloudSave} />;
}

export default function EndlessModePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />}
      >
        <EndlessLoader />
      </Suspense>
    </main>
  );
}
