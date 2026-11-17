"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FEATURE_FLAG_DEFS, type FeatureFlagKey } from "@/lib/feature-flags";

export async function checkUserIsAdmin(userId?: string, email?: string | null): Promise<boolean> {
  if (!userId) return false;
  if (process.env.ADMIN_EMAIL && email && email === process.env.ADMIN_EMAIL) {
    return true;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  return Boolean(user?.isAdmin);
}

export async function toggleFeatureFlag(key: FeatureFlagKey, enabled: boolean) {
  const session = await auth();
  const isAdmin = await checkUserIsAdmin(session?.user?.id, session?.user?.email);

  if (!isAdmin) {
    return { error: "Unauthorized: Admin access required." };
  }

  const validKey = FEATURE_FLAG_DEFS.some((f) => f.key === key);
  if (!validKey) {
    return { error: "Unknown feature flag key." };
  }

  await prisma.featureFlag.upsert({
    where: { key },
    update: { enabled },
    create: { key, enabled },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/flags");
  return { success: true };
}
