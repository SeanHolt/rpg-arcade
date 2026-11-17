import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreatorGameCard } from "@/components/CreatorGameCard";
import { connection } from "next/server";

async function DashboardList() {
    await connection();
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const games = await prisma.game.findMany({
        where: { authorId: session.user.id },
        orderBy: { updatedAt: "desc" },
    });

    if (games.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
                <p className="text-base font-semibold text-zinc-200">
                    You haven&apos;t created any dungeons yet.
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                    Use the Visual Studio to paint a map or upload a JSON blueprint.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {games.map((g) => (
                <CreatorGameCard
                    key={g.id}
                    game={{
                        id: g.id,
                        title: g.title,
                        difficulty: g.difficulty,
                        floorCount: g.floorCount,
                        playCount: g.playCount,
                        isPublic: g.isPublic,
                    }}
                />
            ))}
        </div>
    );
}

export default function DashboardPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Creator Dashboard</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Manage your dungeons, edit maps, and control public visibility.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href="/studio"
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                        + Visual Builder
                    </Link>
                    <Link
                        href="/upload"
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
                    >
                        Upload JSON
                    </Link>
                </div>
            </div>

            <Suspense
                fallback={
                    <div className="h-48 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
                }
            >
                <DashboardList />
            </Suspense>
        </main>
    );
}
