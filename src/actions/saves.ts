"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { SerializedRunSnapshot } from "@/lib/rpg/runtime-types";
import { isFeatureEnabled } from "@/lib/feature-flags";

export async function saveMidRunProgress(input: {
  gameId: string;
  floorName: string;
  snapshot: SerializedRunSnapshot;
}) {
  if (!(await isFeatureEnabled("mid_run_saves"))) {
    return { error: "Mid-run saving is temporarily disabled for maintenance." };
  }
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Log in to save your dungeon progress." };
  }

  const serialized = JSON.stringify(input.snapshot);
  if (serialized.length > 100_000) {
    return { error: "Save file exceeds maximum allowed size." };
  }

  await prisma.gameSave.upsert({
    where: {
      userId_gameId: {
        userId: session.user.id,
        gameId: input.gameId,
      },
    },
    update: {
      floorName: input.floorName,
      heroLevel: input.snapshot.player.level,
      stateJson: serialized,
    },
    create: {
      userId: session.user.id,
      gameId: input.gameId,
      floorName: input.floorName,
      heroLevel: input.snapshot.player.level,
      stateJson: serialized,
    },
  });

  revalidatePath(`/play/${input.gameId}`);
  return { success: true };
}

export async function clearMidRunProgress(gameId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.gameSave.deleteMany({
    where: { userId: session.user.id, gameId },
  });
  revalidatePath(`/play/${gameId}`);
}
export async function saveEndlessProgress(input: {
  floorName: string;
  depth: number;
  snapshot: SerializedRunSnapshot;
}) {
  if (!(await isFeatureEnabled("mid_run_saves"))) {
    return { error: "Mid-run saving is temporarily disabled for maintenance." };
  }
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Log in to save Endless runs to your account." };
  }

  const serialized = JSON.stringify(input.snapshot);
  if (serialized.length > 150_000) {
    return { error: "Save file exceeds maximum allowed size." };
  }

  await prisma.endlessSave.upsert({
    where: { userId: session.user.id },
    update: {
      floorName: input.floorName,
      depth: input.depth,
      heroLevel: input.snapshot.player.level,
      stateJson: serialized,
    },
    create: {
      userId: session.user.id,
      floorName: input.floorName,
      depth: input.depth,
      heroLevel: input.snapshot.player.level,
      stateJson: serialized,
    },
  });

  revalidatePath("/endless");
  return { success: true };
}

export async function clearEndlessProgress() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.endlessSave.deleteMany({
    where: { userId: session.user.id },
  });
  revalidatePath("/endless");
}
