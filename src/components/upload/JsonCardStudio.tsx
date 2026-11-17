"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveGameBlueprint } from "@/actions/creator";
import { RpgBlueprintSchema, type RpgBlueprint } from "@/lib/rpg/schema";
import { createDefaultBlueprint } from "@/lib/rpg/editor-helpers";
import { TestPlayModal } from "@/components/game/TestPlayModal";
import { JsonMetaCard } from "./JsonMetaCard";
import { JsonHeroCard } from "./JsonHeroCard";
import { JsonFloorsCard } from "./JsonFloorsCard";

export function JsonCardStudio() {
  const router = useRouter();
  const [tab, setTab] = useState<"cards" | "raw">("cards");
  const [blueprint, setBlueprint] = useState<RpgBlueprint>(() => createDefaultBlueprint());
  const [rawJson, setRawJson] = useState<string>(() =>
    JSON.stringify(createDefaultBlueprint(), null, 2)
  );
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [testData, setTestData] = useState<RpgBlueprint | null>(null);

  const syncFromCards = (next: RpgBlueprint) => {
    setBlueprint(next);
    setRawJson(JSON.stringify(next, null, 2));
  };

  const switchToCards = () => {
    try {
      const parsedJson = JSON.parse(rawJson);
      const res = RpgBlueprintSchema.safeParse(parsedJson);
      if (!res.success) {
        setErrors(res.error.issues.map((i) => i.message));
        return;
      }
      setErrors([]);
      setBlueprint(res.data);
      setRawJson(JSON.stringify(res.data, null, 2));
      setTab("cards");
    } catch {
      setErrors(["Invalid JSON syntax. Fix any missing commas or brackets before switching to Cards."]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setRawJson(text);
      try {
        const res = RpgBlueprintSchema.safeParse(JSON.parse(text));
        if (res.success) {
          setBlueprint(res.data);
          setErrors([]);
        } else {
          setErrors(res.error.issues.map((i) => i.message));
          setTab("raw");
        }
      } catch {
        setErrors(["Uploaded file is not valid JSON."]);
        setTab("raw");
      }
    };
    reader.readAsText(file);
  };

  const validateCurrent = (): RpgBlueprint | null => {
    try {
      const candidate = tab === "raw" ? JSON.parse(rawJson) : blueprint;
      const res = RpgBlueprintSchema.safeParse(candidate);
      if (!res.success) {
        setErrors(res.error.issues.map((i) => i.message));
        return null;
      }
      setErrors([]);
      syncFromCards(res.data);
      return res.data;
    } catch {
      setErrors(["Invalid JSON syntax."]);
      return null;
    }
  };

  const handlePublish = async () => {
    const valid = validateCurrent();
    if (!valid) return;
    setIsSaving(true);
    const res = await saveGameBlueprint({
      rawJson: JSON.stringify(valid),
      isPublic,
    });
    setIsSaving(false);
    if (res.error) {
      setErrors([res.error, ...(res.issues ?? [])]);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="space-y-5">
      {testData && <TestPlayModal blueprint={testData} onClose={() => setTestData(null)} />}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (tab === "raw" ? switchToCards() : setTab("cards"))}
            className={`rounded-lg px-3.5 py-2 font-semibold ${
              tab === "cards"
                ? "bg-emerald-600 text-white"
                : "border border-zinc-700 bg-zinc-950 text-zinc-300"
            }`}
          >
            🗂️ Visual Cards
          </button>
          <button
            type="button"
            onClick={() => {
              setRawJson(JSON.stringify(blueprint, null, 2));
              setTab("raw");
            }}
            className={`rounded-lg px-3.5 py-2 font-semibold ${
              tab === "raw"
                ? "bg-emerald-600 text-white"
                : "border border-zinc-700 bg-zinc-950 text-zinc-300"
            }`}
          >
            {"{ }"} Raw JSON
          </button>
          <label className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-medium text-zinc-300 hover:bg-zinc-800">
            📁 Import .json
            <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-zinc-300">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Public
          </label>
          <button
            type="button"
            onClick={() => {
              const valid = validateCurrent();
              if (valid) setTestData(valid);
            }}
            className="rounded-lg border border-amber-700 bg-amber-950/60 px-3.5 py-2 font-semibold text-amber-200 hover:bg-amber-900/60"
          >
            ▶ Test Play
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handlePublish}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Dungeon"}
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl border border-red-800 bg-red-950/70 p-4 text-xs text-red-200">
          {errors.map((err, i) => (
            <p key={i}>• {err}</p>
          ))}
        </div>
      )}

      {tab === "cards" ? (
        <div className="space-y-5">
          <JsonMetaCard blueprint={blueprint} onChange={syncFromCards} />
          <JsonHeroCard blueprint={blueprint} onChange={syncFromCards} />
          <JsonFloorsCard blueprint={blueprint} onChange={syncFromCards} />
        </div>
      ) : (
        <textarea
          rows={22}
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          spellCheck={false}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-emerald-300"
        />
      )}
    </div>
  );
}
