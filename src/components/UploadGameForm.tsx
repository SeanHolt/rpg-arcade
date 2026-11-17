"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveGameBlueprint } from "@/actions/creator";
import { RpgBlueprintSchema, type RpgBlueprint } from "@/lib/rpg/schema";
import { SAMPLE_DUNGEON } from "@/lib/rpg/sample-dungeon";
import { TestPlayModal } from "@/components/game/TestPlayModal";

export function UploadGameForm() {
  const router = useRouter();
  const [jsonText, setJsonText] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [previewBlueprint, setPreviewBlueprint] = useState<RpgBlueprint | null>(null);

  const validateCurrentJson = (): RpgBlueprint | null => {
    setError(null);
    setIssues([]);

    if (!jsonText.trim()) {
      setError("Please upload a .json file or paste your RPG JSON blueprint.");
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setError("Invalid JSON syntax. Check for missing commas, quotes, or brackets.");
      return null;
    }

    const result = RpgBlueprintSchema.safeParse(parsed);
    if (!result.success) {
      setError("Your RPG JSON failed blueprint validation:");
      setIssues(
        result.error.issues.map((i) => {
          const path = i.path.length > 0 ? `[${i.path.join(".")}] ` : "";
          return `${path}${i.message}`;
        })
      );
      return null;
    }

    return result.data;
  };

  const handleTestPlay = () => {
    const valid = validateCurrentJson();
    if (valid) {
      setPreviewBlueprint(valid);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = validateCurrentJson();
    if (!valid) return;

    setIsSaving(true);
    const res = await saveGameBlueprint({
      rawJson: JSON.stringify(valid),
      isPublic,
    });
    setIsSaving(false);

    if (res.error) {
      setError(res.error);
      setIssues(res.issues ?? []);
      return;
    }

    if (res.gameId) {
      router.push(isPublic ? `/play/${res.gameId}` : "/dashboard");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    setFileName(file.name);
    setJsonText(await file.text());
  };

  return (
    <div className="space-y-6">
      {previewBlueprint && (
        <TestPlayModal
          blueprint={previewBlueprint}
          onClose={() => setPreviewBlueprint(null)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <span className="text-sm text-zinc-300">
          Need a starting point? Load our 2-floor sample dungeon.
        </span>
        <button
          type="button"
          onClick={() => {
            setFileName("sample-dungeon.json");
            setJsonText(JSON.stringify(SAMPLE_DUNGEON, null, 2));
          }}
          className="rounded-lg border border-emerald-700 bg-emerald-950/60 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/60"
        >
          Load Sample into Editor
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/70 p-4 text-sm text-red-200">
          <p className="font-semibold">{error}</p>
          {issues.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-300">
              {issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
            Select .json File
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <span className="text-xs text-zinc-400">
            {fileName ? `Loaded: ${fileName}` : "No file selected"}
          </span>
        </div>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={15}
          placeholder='{"title": "My Dungeon", ...}'
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-emerald-300 focus:border-emerald-500 focus:outline-none"
        />

        <label className="flex items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-600"
          />
          <span>Make this dungeon publicly playable in the community arcade</span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleTestPlay}
            className="rounded-xl border border-amber-700/70 bg-amber-950/50 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-900/50"
          >
            ▶ Test Play Blueprint
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : isPublic ? "Publish Public RPG" : "Save Private Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
