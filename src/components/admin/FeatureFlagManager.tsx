"use client";

import { useState, useTransition } from "react";
import { toggleFeatureFlag } from "@/actions/flags";
import { FEATURE_FLAG_DEFS, type FeatureFlagKey, type FeatureFlagsMap } from "@/lib/feature-flag-defs";

export function FeatureFlagManager({ initialFlags }: { initialFlags: FeatureFlagsMap }) {
  const [flags, setFlags] = useState<FeatureFlagsMap>(initialFlags);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (key: FeatureFlagKey) => {
    const nextValue = !flags[key];
    setError(null);
    setFlags((prev) => ({ ...prev, [key]: nextValue }));

    startTransition(async () => {
      const res = await toggleFeatureFlag(key, nextValue);
      if (res.error) {
        setError(res.error);
        setFlags((prev) => ({ ...prev, [key]: !nextValue }));
      }
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl border border-red-800 bg-red-950/70 p-3 text-xs text-red-200">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURE_FLAG_DEFS.map((def) => {
          const enabled = flags[def.key];
          return (
            <div
              key={def.key}
              className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition ${
                enabled
                  ? "border-zinc-800 bg-zinc-900/80"
                  : "border-red-900/50 bg-red-950/20"
              }`}
            >
              <div>
                <div className="text-sm font-bold text-zinc-100">{def.label}</div>
                <p className="mt-1 text-xs text-zinc-400">{def.description}</p>
                <span className="mt-1.5 inline-block font-mono text-[10px] text-zinc-500">
                  key: {def.key}
                </span>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleToggle(def.key)}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-50 ${
                  enabled
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {enabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
