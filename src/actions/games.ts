// src/actions/games.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RpgBlueprintSchema } from "@/lib/rpg/schema";

export type UploadGameState = {
  error?: string;
  issues?: string[];
};

export async function uploadRpgGame(
  _prevState: UploadGameState,
  formData: FormData
): Promise<UploadGameState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to upload a game." };
  }

  const rawJson = formData.get("rawJson");
  if (typeof rawJson !== "string" || !rawJson.trim()) {
    return { error: "Please upload a .json file or paste your RPG JSON blueprint." };
  }

  // Guard against overly huge payloads (512 KB max)
  if (rawJson.length > 512_000) {
    return { error: "JSON file is too large (maximum size is 512 KB)." };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch {
    return { error: "Invalid JSON syntax. Check for missing commas, quotes, or brackets." };
  }

  const validation = RpgBlueprintSchema.safeParse(parsedJson);
  if (!validation.success) {
    const formattedIssues = validation.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `[${issue.path.join(".")}] ` : "";
      return `${path}${issue.message}`;
    });

    return {
      error: "Your RPG JSON failed blueprint validation:",
      issues: formattedIssues,
    };
  }

  const blueprint = validation.data;

  const createdGame = await prisma.game.create({
    data: {
      title: blueprint.title,
      description: blueprint.description,
      difficulty: blueprint.difficulty,
      floorCount: blueprint.floors.length,
      gameData: JSON.stringify(blueprint),
      authorId: session.user.id,
    },
  });

  revalidatePath("/");
  redirect(`/play/${createdGame.id}`);
}
