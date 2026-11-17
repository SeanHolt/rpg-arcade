"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFollowCreator(creatorId: string) {
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
