"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const DAILY_COIN_CAP = 150;

export type RewardResult = {
  awarded: number;
  newBalance?: number;
  message?: string;
};

export async function claimDungeonClearReward(input: {
  gameId?: string;
  isEndless?: boolean;
  endlessDepth?: number;
}): Promise<RewardResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      awarded: 0,
      message: "Log in to earn Arcade Coins when clearing dungeons!",
    };
  }

  const userId = session.user.id;
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    return {
      awarded: 0,
      message: "Account not found in database—please log out and log back in!",
    };
  }
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const earnedToday = await prisma.coinReward.aggregate({
    where: {
      userId,
      createdAt: { gte: startOfDay },
    },
    _sum: { coins: true },
  });

  const alreadyToday = earnedToday._sum.coins ?? 0;
  const remainingCap = Math.max(0, DAILY_COIN_CAP - alreadyToday);

  if (remainingCap === 0) {
    return {
      awarded: 0,
      message: `Daily limit reached (${DAILY_COIN_CAP} coins/day). Come back tomorrow for more!`,
    };
  }

  let baseReward = 0;
  let sourceKey = "";

  if (input.isEndless) {
    const depth = Math.max(1, input.endlessDepth ?? 1);
    baseReward = 10;
    sourceKey = `endless:depth-${depth}`;
  } else if (input.gameId) {
    sourceKey = `game:${input.gameId}`;
    const priorClear = await prisma.coinReward.findFirst({
      where: { userId, source: sourceKey },
      select: { id: true },
    });
    baseReward = priorClear ? 5 : 25;
  } else {
    return { awarded: 0 };
  }

  const awarded = Math.min(remainingCap, baseReward);

  const [, updatedUser] = await prisma.$transaction([
    prisma.coinReward.create({
      data: { userId, source: sourceKey, coins: awarded },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: awarded } },
      select: { coins: true },
    }),
  ]);

  revalidatePath("/marketplace");
  return {
    awarded,
    newBalance: updatedUser.coins,
    message: `🪙 Earned +${awarded} Arcade Coins! (Balance: ${updatedUser.coins})`,
  };
}
