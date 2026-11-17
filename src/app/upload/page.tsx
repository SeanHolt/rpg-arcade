import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { JsonCardStudio } from "@/components/upload/JsonCardStudio";

async function UploadAuthGate() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <JsonCardStudio />;
}

export default function UploadPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">JSON Card Builder &amp; Uploader</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Build or edit your RPG blueprint using interactive cards, or switch to Raw JSON anytime.
        </p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-zinc-900" />}>
        <UploadAuthGate />
      </Suspense>
    </main>
  );
}
