import { prisma } from "@/lib/prisma";
import { PackSpritesPayloadSchema } from "./pack-schema";
import type { OwnedPackOption } from "@/components/studio/OwnedPacksBar";

export async function getUserOwnedPacks(userId: string): Promise<OwnedPackOption[]> {
  const rows = await prisma.packOwnership.findMany({
    where: { userId },
    include: { pack: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.flatMap((row) => {
    const parsed = PackSpritesPayloadSchema.safeParse(JSON.parse(row.pack.spritesJson));
    if (!parsed.success) return [];
    return [
      {
        id: row.pack.id,
        title: row.pack.title,
        sprites: parsed.data,
      },
    ];
  });
}
