"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RpgBlueprintSchema } from "@/lib/rpg/schema";

export type CreatorActionResult = {
  success?: boolean;
  gameId?: string;
  error?: string;
  issues?: string[];
};

export async function saveGameBlueprint(input: {
  gameId?: string;
  rawJson: string;
  isPublic: boolean;
}): Promise<CreatorActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to save a game." };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(input.rawJson);
  } catch {
    return { error: "Invalid JSON syntax." };
  }

  const validation = RpgBlueprintSchema.safeParse(parsedJson);
  if (!validation.success) {
    const issues = validation.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `[${issue.path.join(".")}] ` : "";
      return `${path}${issue.message}`;
    });
    return { error: "Blueprint validation failed:", issues };
  }

  const blueprint = validation.data;

  // Update existing game if gameId is provided
  if (input.gameId) {
    const existing = await prisma.game.findUnique({
      where: { id: input.gameId },
      select: { authorId: true },
    });

    if (!existing || existing.authorId !== session.user.id) {
      return { error: "You do not have permission to edit this dungeon." };
    }

    const updated = await prisma.game.update({
      where: { id: input.gameId },
      data: {
        title: blueprint.title,
        description: blueprint.description,
        difficulty: blueprint.difficulty,
        floorCount: blueprint.floors.length,
        gameData: JSON.stringify(blueprint),
        isPublic: input.isPublic,
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/play/${updated.id}`);
    return { success: true, gameId: updated.id };
  }

  // Create new game
  const created = await prisma.game.create({
    data: {
      title: blueprint.title,
      description: blueprint.description,
      difficulty: blueprint.difficulty,
      floorCount: blueprint.floors.length,
      gameData: JSON.stringify(blueprint),
      isPublic: input.isPublic,
      authorId: session.user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true, gameId: created.id };
}

export async function toggleGameVisibility(gameId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { authorId: true, isPublic: true },
  });

  if (!game || game.authorId !== session.user.id) return;

  await prisma.game.update({
    where: { id: gameId },
    data: { isPublic: !game.isPublic },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function deleteUserGame(gameId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { authorId: true },
  });

  if (!game || game.authorId !== session.user.id) return;

  await prisma.game.delete({ where: { id: gameId } });

  revalidatePath("/");
  revalidatePath("/dashboard");
}
