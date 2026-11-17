// src/app/login/page.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginUser, type AuthActionState } from "@/actions/auth";

export default function LoginPage() {
  const [state, action, isPending] = useActionState<AuthActionState, FormData>(
    loginUser,
    {}
  );

  return (
    <main className="mx-auto mt-16 max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-100">
      <h1 className="text-2xl font-bold">Log In</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Welcome back to the RPG Arcade.
      </p>

      <form action={action} className="mt-6 space-y-4">
        {state.error && (
          <p className="rounded bg-red-950/70 p-3 text-sm text-red-300 border border-red-800">
            {state.error}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-300">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300">Password</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Log In"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-400">
        Need an account?{" "}
        <Link href="/register" className="text-emerald-400 hover:underline">
          Register
        </Link>
      </p>
    </main>
  );
}
