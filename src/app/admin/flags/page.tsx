import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { checkUserIsAdmin } from "@/actions/flags";
import { getFeatureFlags } from "@/lib/feature-flags";
import { FeatureFlagManager } from "@/components/admin/FeatureFlagManager";

async function AdminFlagsGate() {
  await connection();
  const session = await auth();
  const isAdmin = await checkUserIsAdmin(session?.user?.id, session?.user?.email);

  if (!isAdmin) redirect("/");

  const flags = await getFeatureFlags();
  return <FeatureFlagManager initialFlags={flags} />;
}

export default function AdminFlagsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Admin Feature Flags</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Enable or disable arcade subsystems in real time without redeploying.
        </p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-zinc-900" />}>
        <AdminFlagsGate />
      </Suspense>
    </main>
  );
}
