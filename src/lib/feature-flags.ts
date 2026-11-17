import { prisma } from "@/lib/prisma";
import {
  getDefaultFeatureFlags,
  type FeatureFlagKey,
  type FeatureFlagsMap,
} from "./feature-flag-defs";

export * from "./feature-flag-defs";

export async function getFeatureFlags(): Promise<FeatureFlagsMap> {
  const defaults = getDefaultFeatureFlags();
  try {
    const rows = await prisma.featureFlag.findMany();
    for (const row of rows) {
      if (row.key in defaults) {
        defaults[row.key as FeatureFlagKey] = row.enabled;
      }
    }
  } catch {
    // Fail open with safe defaults if database is temporarily unavailable
  }
  return defaults;
}

export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[key];
}
