"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags";

export type LeaderboardRow = {
  id: string;
  playerName: string;
  heroName: string;
  heroClass: string;
  heroLevel: number;
  turnsTaken: number;
  depthReached: number;
  createdAtLabel: string;
};

export async function submitRunScore(input: {
  gameId?: string;
  isEndless?: boolean;
  heroName: string;
  heroClass: string;
  heroLevel: number;
  turnsTaken: number;
  depthReached: number;
}) {
  if (!(await isFeatureEnabled("leaderboards_enabled"))) {
    return { saved: false };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { saved: false };

  const safeTurns = Math.max(1, Math.floor(input.turnsTaken));
  const safeDepth = Math.max(1, Math.floor(input.depthReached));

  try {
    if (input.isEndless) {
      await prisma.runScore.create({
        data: {
          userId,
          mode: "endless",
          heroName: input.heroName.slice(0, 32),
          heroClass: input.heroClass.slice(0, 32),
          heroLevel: input.heroLevel,
          turnsTaken: safeTurns,
          depthReached: safeDepth,
        },
      });
      revalidatePath("/endless");
      return { saved: true };
    }

    if (!input.gameId) return { saved: false };

    await prisma.runScore.create({
      data: {
        userId,
        gameId: input.gameId,
        mode: "dungeon",
        heroName: input.heroName.slice(0, 32),
        heroClass: input.heroClass.slice(0, 32),
        heroLevel: input.heroLevel,
        turnsTaken: safeTurns,
        depthReached: 1,
      },
    });
    revalidatePath(`/play/${input.gameId}`);
    return { saved: true };
  } catch {
    return { saved: false };
  }
}

export async function getDungeonLeaderboard(gameId: string): Promise<LeaderboardRow[]> {
  if (!(await isFeatureEnabled("leaderboards_enabled"))) return [];

  const rows = await prisma.runScore.findMany({
    where: { gameId, mode: "dungeon" },
    orderBy: [{ turnsTaken: "asc" }, { createdAt: "asc" }],
    take: 10,
    include: { user: { select: { name: true } } },
  });

  return rows.map((r) => ({
    id: r.id,
    playerName: r.user.name ?? "Anonymous",
    heroName: r.heroName,
    heroClass: r.heroClass,
    heroLevel: r.heroLevel,
    turnsTaken: r.turnsTaken,
    depthReached: r.depthReached,
    createdAtLabel: r.createdAt.toLocaleDateString(),
  }));
}

export async function getEndlessLeaderboard(): Promise<LeaderboardRow[]> {
  if (!(await isFeatureEnabled("leaderboards_enabled"))) return [];

  const rows = await prisma.runScore.findMany({
    where: { mode: "endless" },
    orderBy: [{ depthReached: "desc" }, { turnsTaken: "asc" }, { createdAt: "asc" }],
    take: 10,
    include: { user: { select: { name: true } } },
  });

  return rows.map((r) => ({
    id: r.id,
    playerName: r.user.name ?? "Anonymous",
    heroName: r.heroName,
    heroClass: r.heroClass,
    heroLevel: r.heroLevel,
    turnsTaken: r.turnsTaken,
    depthReached: r.depthReached,
    createdAtLabel: r.createdAt.toLocaleDateString(),
  }));
}
