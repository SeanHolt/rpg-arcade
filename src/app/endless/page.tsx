import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFeatureFlags } from "@/lib/feature-flags";
import { getEndlessLeaderboard } from "@/actions/leaderboards";
import { FeatureDisabledBanner } from "@/components/game/FeatureDisabledBanner";
import { EndlessClientShell } from "@/components/game/EndlessClientShell";
import { LeaderboardCard } from "@/components/game/LeaderboardCard";
import type { SavedRunData } from "@/components/game/SaveRunControls";

async function EndlessLoader() {
  await connection();
  const [session, flags] = await Promise.all([auth(), getFeatureFlags()]);

  if (!flags.endless_mode) {
    return <FeatureDisabledBanner featureName="Endless Dungeon Mode" />;
  }

  const userId = session?.user?.id;

  const [dbSave, hallOfFame] = await Promise.all([
    userId
      ? prisma.endlessSave.findUnique({
          where: { userId },
          select: { floorName: true, heroLevel: true, stateJson: true, updatedAt: true },
        })
      : null,
    flags.leaderboards_enabled ? getEndlessLeaderboard() : Promise.resolve([]),
  ]);

  const cloudSave: SavedRunData | undefined = dbSave
    ? {
        floorName: dbSave.floorName,
        heroLevel: dbSave.heroLevel,
        updatedAtLabel: dbSave.updatedAt.toLocaleString(),
        snapshot: JSON.parse(dbSave.stateJson),
      }
    : undefined;

  return (
    <div className="space-y-8">
      <EndlessClientShell
        isLoggedIn={Boolean(userId)}
        cloudSave={cloudSave}
        flags={flags}
      />

      {flags.leaderboards_enabled && (
        <LeaderboardCard
          title="🏆 Endless Abyss Hall of Fame"
          rows={hallOfFame}
          isEndless
        />
      )}
    </div>
  );
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
