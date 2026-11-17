"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateAssetPackSchema, type PackSpritesPayload } from "@/lib/rpg/pack-schema";

export async function publishAssetPack(input: {
  title: string;
  description: string;
  price: number;
  sprites: PackSpritesPayload;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Log in to publish an asset pack." };

  const parsed = CreateAssetPackSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.at(0)?.message ?? "Invalid pack data." };
  }

  const hasAnySprite =
    Object.values(parsed.data.sprites.tiles).some(Boolean) ||
    parsed.data.sprites.entities.length > 0;

  if (!hasAnySprite) {
    return { error: "Draw or upload at least one tile or character sprite before publishing." };
  }

  const pack = await prisma.assetPack.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      spritesJson: JSON.stringify(parsed.data.sprites),
      authorId: session.user.id,
      owners: {
        create: { userId: session.user.id },
      },
    },
  });

  revalidatePath("/marketplace");
  revalidatePath("/studio");
  return { success: true, packId: pack.id };
}

export async function unlockAssetPack(packId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Log in to unlock asset packs." };
  const buyerId = session.user.id;

  const [buyer, pack, alreadyOwned] = await Promise.all([
    prisma.user.findUnique({ where: { id: buyerId }, select: { coins: true } }),
    prisma.assetPack.findUnique({
      where: { id: packId },
      select: { id: true, price: true, authorId: true },
    }),
    prisma.packOwnership.findUnique({
      where: { userId_packId: { userId: buyerId, packId } },
    }),
  ]);

  if (!buyer || !pack) return { error: "Asset pack not found." };
  if (alreadyOwned) return { success: true };
  if (buyer.coins < pack.price) {
    return { error: `Not enough Arcade Coins (need ${pack.price}, you have ${buyer.coins}).` };
  }

  await prisma.$transaction([
    ...(pack.price > 0
      ? [
          prisma.user.update({
            where: { id: buyerId },
            data: { coins: { decrement: pack.price } },
          }),
          prisma.user.update({
            where: { id: pack.authorId },
            data: { coins: { increment: pack.price } },
          }),
        ]
      : []),
    prisma.packOwnership.create({
      data: { userId: buyerId, packId: pack.id },
    }),
  ]);

  revalidatePath("/marketplace");
  revalidatePath("/studio");
  return { success: true };
}
