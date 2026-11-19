"use client";

import { useEffect, useRef, useState } from "react";
import type { RpgBlueprint } from "@/lib/rpg/schema";
import { claimDungeonClearReward } from "@/actions/rewards";
import { HeroSelectScreen } from "./HeroSelectScreen";
import { DungeonGrid } from "./DungeonGrid";
import { GameSidebar } from "./GameSidebar";
import { NpcInteractionModal } from "./NpcInteractionModal";
import {
    ResumeSaveBanner,
    SaveProgressButton,
    type SavedRunData,
} from "./SaveRunControls";
import { useGameStore } from "@/store/useGameStore";
import { type FeatureFlagsMap } from "@/lib/feature-flag-defs";
import { SoundToggleButton } from "./SoundToggleButton";
import { submitRunScore } from "@/actions/leaderboards";
import { startBgMusic, stopBgMusic } from "@/lib/audio/music-sequencer";
import { THEME_MUSIC_PRESETS } from "@/lib/audio/music-presets";

type RpgPlayerProps = {
    gameId?: string;
    blueprint: RpgBlueprint;
    authorName: string;
    isEndless?: boolean;
    isLoggedIn?: boolean;
    savedRun?: SavedRunData;
    flags?: FeatureFlagsMap;
};

export function RpgPlayer({
    gameId,
    blueprint,
    authorName,
    isEndless,
    savedRun,
    isLoggedIn,
    flags,
}: RpgPlayerProps) {
    const {
        blueprint: activeBlueprint,
        status,
        endlessDepth,
        currentFloorId,
        activeNpcId,
        player,
        enemiesByFloor,
        usedShrines,
        openedChests,
        exploredTiles,
        potions,
        gearBag,
        logs,
        initGame,
        startRun,
        restoreSnapshot,
        descendEndlessDepth,
        resetGame,
        movePlayer,
        rangedAttack,
        usePotion,
        equipGear,
        closeNpcDialogue,
        buyShopItem,
        activeQuests,
        completedQuestIds,
        turnsTaken,
        acceptQuest,
        claimQuestReward,
        triggerClassSkill,
        sellGear,
        brokenWalls,
    } = useGameStore();
    const initializedForRef = useRef<RpgBlueprint | null>(null);
    useEffect(() => {
        if (initializedForRef.current === blueprint) return;
        initializedForRef.current = blueprint;
        initGame(blueprint, isEndless, flags);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blueprint, isEndless, initGame]);

    const [rewardState, setRewardState] = useState<{ key: string; message: string } | null>(null);
    const claimedForRunRef = useRef<string | null>(null);
    const liveBlueprint = activeBlueprint ?? blueprint;
    const currentFloor =
        liveBlueprint.floors.find((f) => f.id === currentFloorId) ?? liveBlueprint.floors.at(0)!;
    const livingEnemies = (enemiesByFloor[currentFloor.id] ?? []).filter((e) => e.currentHp > 0);
    const activeNpc = (currentFloor.npcs ?? []).find((n) => n.id === activeNpcId);

    const currentRunKey =
        status === "victory" && (gameId || isEndless)
            ? isEndless
                ? `endless-${endlessDepth}`
                : `game-${gameId}`
            : null;

    useEffect(() => {
        if (!currentRunKey || !player || claimedForRunRef.current === currentRunKey) return;
        claimedForRunRef.current = currentRunKey;

        claimDungeonClearReward({ gameId, isEndless, endlessDepth }).then((res) => {
            if (res.message) {
                setRewardState({ key: currentRunKey, message: res.message });
            }
        });

        if (flags?.leaderboards_enabled) {
            submitRunScore({
                gameId,
                isEndless,
                heroName: player.name,
                heroClass: player.className,
                heroLevel: player.level,
                turnsTaken,
                depthReached: endlessDepth,
            });
        }
    }, [currentRunKey, gameId, isEndless, endlessDepth, player, turnsTaken, flags?.leaderboards_enabled]);
    const activeTrack =
        currentFloor?.musicTrack ?? THEME_MUSIC_PRESETS[liveBlueprint.theme ?? "crypt"];

    useEffect(() => {
        if (status === "playing" && activeTrack) {
            startBgMusic(activeTrack);
        } else {
            stopBgMusic();
        }
        return () => stopBgMusic();
    }, [status, currentFloorId, activeTrack]);
    const rewardMsg =
        rewardState && rewardState.key === currentRunKey ? rewardState.message : null;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== "playing" || activeNpcId) return;
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === " ") {
                rangedAttack();
                return;
            }
            if (e.key.toLowerCase() === "q") {
                triggerClassSkill();
                return;
            }
            switch (e.key.toLowerCase()) {
                case "w":
                case "arrowup":
                    movePlayer(0, -1);
                    break;
                case "s":
                case "arrowdown":
                    movePlayer(0, 1);
                    break;
                case "a":
                case "arrowleft":
                    movePlayer(-1, 0);
                    break;
                case "d":
                case "arrowright":
                    movePlayer(1, 0);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [status, activeNpcId, movePlayer, rangedAttack, triggerClassSkill]);
    if (status === "selecting") {
        return (
            <div>
                {gameId && savedRun && flags?.mid_run_saves === true && (
                    <ResumeSaveBanner
                        gameId={gameId}
                        savedRun={savedRun}
                        onResume={(snap) => restoreSnapshot(snap)}
                        isLoggedIn={isLoggedIn}
                    />
                )}
                <HeroSelectScreen
                    blueprint={blueprint}
                    authorName={authorName}
                    onStart={(classId, customName) => startRun(classId, customName)}
                />
            </div>
        );
    }

    if (!player) {
        return <div className="h-96 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />;
    }

    return (
        <div className="space-y-6">
            {activeNpc && (
                <NpcInteractionModal
                    npc={activeNpc}
                    playerGold={player.gold}
                    activeQuest={activeQuests.find((q) => q.questId === activeNpc.quest?.id)}
                    isQuestCompleted={Boolean(
                        activeNpc.quest && completedQuestIds.includes(activeNpc.quest.id)
                    )}
                    onAcceptQuest={() => acceptQuest(activeNpc.id)}
                    onClaimQuest={(questId) => claimQuestReward(questId)}
                    onBuyItem={(itemId) => buyShopItem(activeNpc.id, itemId)}
                    onClose={closeNpcDialogue}
                />
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-zinc-100">{liveBlueprint.title}</h1>
                        <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
                            {liveBlueprint.difficulty}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                        Created by <span className="text-zinc-200">{authorName}</span> • Floor:{" "}
                        <span className="font-semibold text-emerald-400">{currentFloor.name}</span> • Turns:{" "}
                        <span className="font-mono font-semibold text-zinc-200">{turnsTaken}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <SoundToggleButton />
                    {(gameId || isEndless) && flags?.mid_run_saves && status === "playing" && (
                        <SaveProgressButton
                            gameId={gameId}
                            isEndless={isEndless}
                            isLoggedIn={isLoggedIn}
                            floorName={currentFloor.name}
                            getSnapshot={() => ({
                                blueprint: isEndless ? liveBlueprint : undefined,
                                endlessDepth: isEndless ? endlessDepth : undefined,
                                currentFloorId,
                                player,
                                enemiesByFloor,
                                usedShrines,
                                openedChests,
                                exploredTiles,
                                turnsTaken,
                                brokenWalls,
                                potions,
                                gearBag,
                                activeQuests,
                                completedQuestIds,
                                logs,
                            })}
                        />
                    )}
                    <button
                        type="button"
                        onClick={resetGame}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
                    >
                        ↻ Change Hero / Restart
                    </button>
                </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
                <div className="relative flex items-start justify-center overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                    {status !== "playing" && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start rounded-xl bg-zinc-950/90 px-6 pt-14 text-center backdrop-blur-sm">

                            <div className="text-5xl">{status === "victory" ? "🏆" : "💀"}</div>
                            <h2 className="mt-3 text-2xl font-bold text-zinc-100">
                                {status === "victory"
                                    ? isEndless
                                        ? `Depth ${endlessDepth} Cleared!`
                                        : "Dungeon Conquered!"
                                    : "You Have Fallen"}
                            </h2>
                            <p className="mt-1 max-w-sm text-sm text-zinc-400">
                                {status === "victory"
                                    ? isEndless
                                        ? `${player.name} defeated the guardian! Ready to descend deeper?`
                                        : `${player.name} defeated the boss of ${liveBlueprint.title} at Level ${player.level}!`
                                    : isEndless
                                        ? `${player.name} reached Depth ${endlessDepth} at Level ${player.level}. (Completed in ${turnsTaken} turns)`
                                        : `${player.name} fell in battle. Try a different class or heal at shrines!`}
                            </p>

                            {status === "victory" && rewardMsg && (
                                <div className="mt-3 rounded-lg border border-amber-700/60 bg-amber-950/60 px-4 py-2 text-xs font-semibold text-amber-300">
                                    {rewardMsg}
                                </div>
                            )}

                            <div className="mt-5 flex gap-3">
                                {status === "victory" && isEndless && (
                                    <button
                                        type="button"
                                        onClick={descendEndlessDepth}
                                        className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
                                    >
                                        ⬇️ Descend to Depth {endlessDepth + 1}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={resetGame}
                                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
                                >
                                    {isEndless && status === "victory" ? "New Run" : "Play Again"}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="mx-auto w-fit">
                        <DungeonGrid
                            floor={currentFloor}
                            themeId={liveBlueprint.theme}
                            customSprites={liveBlueprint.customSprites}
                            fogOfWar={Boolean(liveBlueprint.fogOfWar)}
                            exploredTiles={exploredTiles}
                            player={player}
                            enemies={livingEnemies}
                            openedChests={openedChests}
                            usedShrines={usedShrines}
                            onAttackEnemy={(enemyId) => rangedAttack(enemyId)}
                        />
                    </div>
                </div>

                <GameSidebar
                    player={player}
                    enemies={livingEnemies}
                    potions={potions}
                    gearBag={gearBag}
                    activeQuests={activeQuests}
                    logs={logs}
                    onUsePotion={usePotion}
                    onEquipGear={equipGear}
                    onSellGear={sellGear}
                />
            </div>
        </div>
    );
}
