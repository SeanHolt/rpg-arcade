import Link from "next/link";

export function FeatureDisabledBanner({ featureName }: { featureName: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-amber-800/60 bg-amber-950/30 p-8 text-center">
      <div className="text-3xl">🚧</div>
      <h2 className="mt-3 text-lg font-bold text-amber-200">
        {featureName} Temporarily Disabled
      </h2>
      <p className="mt-2 text-xs text-zinc-400">
        An administrator has temporarily paused this feature for maintenance. All your saved progress and items remain safe.
      </p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
      >
        ← Return to Arcade
      </Link>
    </div>
  );
}
