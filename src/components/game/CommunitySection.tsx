"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteGameComment,
  postGameComment,
  toggleGameUpvote,
} from "@/actions/community";

export type CommentItem = {
  id: string;
  content: string;
  authorName: string;
  userId: string;
  createdAtLabel: string;
};

type Props = {
  gameId: string;
  currentUserId?: string;
  upvoteCount: number;
  hasUpvoted: boolean;
  comments: CommentItem[];
};

export function CommunitySection({
  gameId,
  currentUserId,
  upvoteCount,
  hasUpvoted,
  comments,
}: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpvote = () => {
    if (!currentUserId) {
      setError("Please log in to upvote this dungeon.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await toggleGameUpvote(gameId);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await postGameComment(gameId, text);
      if (res.error) {
        setError(res.error);
      } else {
        setText("");
      }
    });
  };

  return (
    <section className="mt-8 space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">
            Community & Reviews ({comments.length})
          </h2>
          <p className="text-xs text-zinc-400">
            Share feedback, strategies, or upvote dungeons you enjoyed.
          </p>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleUpvote}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            hasUpvoted
              ? "border-amber-600 bg-amber-950/70 text-amber-300"
              : "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          <span>{hasUpvoted ? "★" : "☆"}</span>
          <span>Upvote ({upvoteCount})</span>
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Leave a strategy tip or review..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isPending ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-xs text-zinc-400">
          <Link href="/login" className="text-emerald-400 hover:underline">
            Log in
          </Link>{" "}
          to upvote or leave a comment.
        </p>
      )}

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-zinc-500">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-zinc-800/80 bg-zinc-950/80 p-3.5 text-sm"
            >
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200">{c.authorName}</span>
                <div className="flex items-center gap-3">
                  <span>{c.createdAtLabel}</span>
                  {currentUserId === c.userId && (
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          await deleteGameComment(c.id, gameId);
                        })
                      }
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1.5 text-zinc-300">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
