// src/components/Navbar.tsx
import Link from "next/link";
import { auth } from "@/auth";
import { logoutUser } from "@/actions/auth";
import { connection } from "next/server";
import { checkUserIsAdmin } from "@/actions/flags";
import { getFeatureFlags } from "@/lib/feature-flags";

export async function Navbar() {
    await connection();
    const session = await auth();
    const flags = await getFeatureFlags();
    const isAdmin = await checkUserIsAdmin(session?.user?.id, session?.user?.email);
    return (
        <header className="border-b border-zinc-800 bg-zinc-950 text-zinc-100">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                <Link href="/" className="text-lg font-bold tracking-tight text-emerald-400">
                    ⚔️ JSON RPG Arcade
                </Link>

                <div className="flex items-center gap-4 text-sm">
                    <Link href="/" className="text-zinc-300 hover:text-white">
                        Browse Games
                    </Link>
                    {flags.endless_mode === true && <Link href="/endless" className="font-medium text-amber-400 hover:text-amber-300">
                        ♾️ Endless Mode
                    </Link>}
                    {flags.marketplace === true && <Link href="/marketplace" className="text-zinc-300 hover:text-white">
                        🎨 Asset Store
                    </Link>}
                    {flags.billing_enabled && (
                        <Link href="/billing" className="text-amber-300 hover:text-amber-200">
                            🪙 Get Coins / Pro
                        </Link>
                    )}
                    {session?.user ? (
                        <>
                            <Link href="/dashboard" className="text-zinc-300 hover:text-white">
                                My Games
                            </Link>
                            <Link
                                href="/studio"
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-500"
                            >
                                + Studio
                            </Link>
                            <Link
                                href="/upload"
                                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-800"
                            >
                                Upload JSON
                            </Link>
                            {isAdmin && <Link href="/admin/flags" className="text-amber-300 hover:text-amber-200">⚙️ Flags</Link>}
                            <form action={logoutUser}>
                                <button type="submit" className="text-zinc-400 hover:text-red-400">
                                    Log out
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-zinc-300 hover:text-white">
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg border border-zinc-700 px-3 py-1.5 hover:bg-zinc-800"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
