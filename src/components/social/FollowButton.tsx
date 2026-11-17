"use client";

import { useState, useTransition } from "react";
import { toggleFollowCreator } from "@/actions/follows";

type Props = {
  creatorId: string;
  initialFollowing: boolean;
  initialCount: number;
  disabled?: boolean;
};

export function FollowButton({
  creatorId,
  initialFollowing,
  initialCount,
  disabled = false,
}: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (disabled || isPending) return;

    const next = !following;
    setFollowing(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));

    startTransition(async () => {
      const res = await toggleFollowCreator(creatorId);
      if (res.error) {
        setFollowing(!next);
        setCount(initialCount);
      }
    });
  };

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={handleToggle}
      className={`rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
        following
          ? "border-emerald-600 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60"
          : "border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
      }`}
    >
      {following ? "✓ Following" : "+ Follow Creator"} ({count})
    </button>
  );
}
