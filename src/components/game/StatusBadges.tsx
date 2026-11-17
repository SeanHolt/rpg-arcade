"use client";

import type { ActiveStatusEffect } from "@/lib/rpg/runtime-types";

export function StatusBadges({ statuses }: { statuses?: ActiveStatusEffect[] }) {
  if (!statuses || statuses.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {statuses.map((st, idx) => {
        const style =
          st.type === "burn"
            ? "border-orange-700/60 bg-orange-950/60 text-orange-300"
            : st.type === "freeze"
              ? "border-cyan-700/60 bg-cyan-950/60 text-cyan-300"
              : "border-lime-700/60 bg-lime-950/60 text-lime-300";

        const icon = st.type === "burn" ? "🔥" : st.type === "freeze" ? "❄️" : "🧪";

        return (
          <span
            key={`${st.type}-${idx}`}
            className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${style}`}
          >
            {icon} {st.type} ({st.turnsLeft}t)
          </span>
        );
      })}
    </div>
  );
}
