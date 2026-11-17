"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags";

export async function toggleFollowCreator(creatorId: string) {
  if (!(await isFeatureEnabled("social_follows"))) {
    return { error: "Creator following is temporarily disabled." };
  }
  const session = await auth();
  const followerId = session?.user?.id;

  if (!followerId) {
    return { error: "Log in to follow creators." };
  }

  if (followerId === creatorId) {
    return { error: "You cannot follow yourself." };
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: creatorId,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({
      data: { followerId, followingId: creatorId },
    });
  }

  revalidatePath("/");
  revalidatePath(`/creator/${creatorId}`);
  return { following: !existing };
}
