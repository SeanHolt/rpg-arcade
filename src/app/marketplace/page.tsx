import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PackSpritesPayloadSchema } from "@/lib/rpg/pack-schema";
import { MarketplaceFeed, type MarketplacePackItem } from "@/components/marketplace/MarketplaceFeed";

async function MarketplaceLoader() {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  const [user, rawPacks] = await Promise.all([
    userId
      ? prisma.user.findUnique({ where: { id: userId }, select: { coins: true } })
      : Promise.resolve(null),
    prisma.assetPack.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        owners: userId ? { where: { userId }, select: { id: true } } : false,
      },
    }),
  ]);

  const packs: MarketplacePackItem[] = rawPacks.flatMap((p) => {
    const parsed = PackSpritesPayloadSchema.safeParse(JSON.parse(p.spritesJson));
    if (!parsed.success) return [];
    return [
      {
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        authorName: p.author.name ?? "Creator",
        isOwned: Array.isArray(p.owners) && p.owners.length > 0,
        sprites: parsed.data,
      },
    ];
  });

  return (
    <MarketplaceFeed
      isLoggedIn={Boolean(userId)}
      userCoins={user?.coins ?? 0}
      packs={packs}
    />
  );
}

export default function MarketplacePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-zinc-900" />}>
        <MarketplaceLoader />
      </Suspense>
    </main>
  );
}
