"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const commentSchema = z.object({
  gameId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(2, "Comment must be at least 2 characters.")
    .max(500, "Comment cannot exceed 500 characters."),
});

export async function toggleGameUpvote(gameId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Log in to upvote dungeons." };

  const existing = await prisma.upvote.findUnique({
    where: {
      userId_gameId: {
        userId: session.user.id,
        gameId,
      },
    },
  });

  if (existing) {
    await prisma.upvote.delete({ where: { id: existing.id } });
  } else {
    await prisma.upvote.create({
      data: { userId: session.user.id, gameId },
    });
  }

  revalidatePath(`/play/${gameId}`);
  revalidatePath("/");
  return { success: true };
}

export async function postGameComment(gameId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Log in to post a comment." };

  const parsed = commentSchema.safeParse({ gameId, content });
  if (!parsed.success) {
    return { error: parsed.error.issues.at(0)?.message ?? "Invalid comment." };
  }

  await prisma.comment.create({
    data: {
      gameId: parsed.data.gameId,
      content: parsed.data.content,
      userId: session.user.id,
    },
  });

  revalidatePath(`/play/${gameId}`);
  return { success: true };
}

export async function deleteGameComment(commentId: string, gameId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment || comment.userId !== session.user.id) return;

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/play/${gameId}`);
}
