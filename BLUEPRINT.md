# Project Blueprint: JSON-Driven 2D Web RPG Arcade

## 1. Tech Stack & Runtime Rules
- **Framework:** Next.js 16 (App Router, `cacheComponents` enabled) + TypeScript + Tailwind CSS v4
- **Next.js 16 Rule:** Always wrap dynamic data reads (`auth()`, `params`, Prisma queries) in `<Suspense>`, and call `await connection()` from `"next/server"` right before `await auth()` in server components.
- **Database:** SQLite (`file:./prisma/dev.db`) + Prisma ORM v7 (`@prisma/adapter-better-sqlite3`, `prisma.config.ts`, generated client at `src/generated/prisma/client`).
- **Authentication:** Auth.js v5 (`next-auth@beta` + `@auth/prisma-adapter` + `bcryptjs`) using JWT sessions and Credentials login (`AUTH_SECRET` in `.env`).
- **State Management:** Zustand (`zustand`) for live RPG gameplay (`useGameStore`) and Visual Dungeon Studio (`useEditorStore`).
- **Validation:** Zod (`zod`) for RPG JSON blueprints, asset packs, and forms.
- **Theme Rule:** `src/app/globals.css` enforces dark mode (`background-color: #09090b`, `color: #f4f4f5`, `color-scheme: dark`) on `html`, `body`, `input`, `textarea`, and `select`.

## 2. File Structure & Responsibilities
- `prisma/schema.prisma` & `prisma/seed.ts` — Models: `User` (`coins`), `Account`, `Session`, `VerificationToken`, `Game` (`isPublic`, `playCount`, `gameData`), `Upvote`, `Comment`, `AssetPack`, `PackOwnership`, `CoinReward`, `GameSave` (`@@unique([userId, gameId])`), `EndlessSave` (`@@unique([userId])`).
- `src/auth.ts` & `src/lib/prisma.ts` — Auth.js config and Better-SQLite3 Prisma singleton (`path.join(process.cwd(), "prisma", "dev.db")`).
- `src/lib/rpg/schema.ts` — `RpgBlueprintSchema` (`theme`, `customSprites`, `fogOfWar`, `visionRadius`, `classes` with `combatType: "melee" | "ranged"`, `range`, `starterItems`, `skill`, `element`; `floors` with `#`, `.`, `S`, `H`, `enemies`, `chests`, `npcs` with `shopItems` & `quest`, `stairways`; supports emojis or 16×16 PNG base64 data URLs).
- `src/lib/rpg/pack-schema.ts` & `src/lib/rpg/load-owned-packs.ts` — Asset Pack bundle schema and server helper to load a user's unlocked packs.
- `src/lib/rpg/runtime-types.ts` — Shared runtime types (`GameStatus`, `ActiveEnemy`, `PotionItem`, `GearItem`, `ActiveQuestProgress`, `ActiveStatusEffect`, `PlayerRuntimeState`, `SerializedRunSnapshot`).
- `src/lib/rpg/themes.ts` — Built-in visual themes (`crypt`, `scifi`, `pirate`, `magma`).
- `src/lib/rpg/combat-helpers.ts`, `src/lib/rpg/melee-combat.ts`, `src/lib/rpg/turn-resolver.ts` — Hero initialization, equipment stat calculation, XP/leveling, fog-of-war reveals, melee bump combat, ranged attacks, Endless full-floor clear checks, chests, shrines, and stairs.
- `src/lib/rpg/quest-helpers.ts`, `src/lib/rpg/skill-resolver.ts`, `src/lib/rpg/elemental-helpers.ts` — Active NPC quest progress counters, `[Q]` signature class skills (`cleave`, `piercing_shot`, `mend`, `blink`), and elemental statuses (`fire` → Burn, `ice` → Freeze, `venom` → Poison).
- `src/lib/rpg/endless-generator.ts` — Procedural room/corridor generator (`generateEndlessFloor(depth)`, `createEndlessBlueprint()`).
- `src/lib/rpg/editor-helpers.ts` & `src/lib/rpg/editor-paint.ts` — `BrushTool` types, blank grid/blueprint factories, `resizeFloorGrid()` (8×8 to 24×24), and tile/entity brush painting logic.
- `src/lib/rpg/sample-dungeon.ts` & `showcase-dungeon.ts` — Seeded 2-floor and 3-floor dungeons.
- `src/store/useGameStore.ts` — Live RPG session (`initGame`, `startRun`, `restoreSnapshot`, `movePlayer`, `rangedAttack`, `triggerClassSkill`, `usePotion`, `equipGear`, `unequipSlot`, `acceptQuest`, `claimQuestReward`, `closeNpcDialogue`, `buyShopItem`, `descendEndlessDepth`).
- `src/store/useEditorStore.ts` — Visual Studio state (`paintCell`, `resizeActiveFloor`, `updateEnemy`, `updateChest`, `updateNpc`, `setStairTarget`, `addHeroClass`, `updateHeroClass`, `removeHeroClass`, `setClassStarterItems`, `setCustomSprite`).
- `src/actions/` — `auth.ts` (register/login/logout), `games.ts` (JSON upload), `creator.ts` (`saveGameBlueprint`, `toggleGameVisibility`, `deleteUserGame`), `community.ts` (`toggleGameUpvote`, `postGameComment`, `deleteGameComment`), `marketplace.ts` (`publishAssetPack`, `unlockAssetPack`), `rewards.ts` (`claimDungeonClearReward`), `saves.ts` (`saveMidRunProgress`, `clearMidRunProgress`, `saveEndlessProgress`, `clearEndlessProgress`).
- `src/components/game/` — `RpgPlayer.tsx`, `HeroSelectScreen.tsx`, `DungeonGrid.tsx`, `GameSidebar.tsx`, `EquipmentPanel.tsx`, `QuestTrackerCard.tsx`, `NpcInteractionModal.tsx`, `SaveRunControls.tsx`, `EndlessClientShell.tsx`, `SpriteDisplay.tsx`, `TestPlayModal.tsx`, `CommunitySection.tsx`.
- `src/components/studio/` — `DungeonStudio.tsx`, `OwnedPacksBar.tsx`, `ClassBuilderPanel.tsx`, `ClassCardEditor.tsx`, `ClassSkillEditor.tsx`, `StudioGrid.tsx`, `StudioInspector.tsx`, `NpcInspectorCard.tsx`, `NpcQuestEditor.tsx`, `PixelArtModal.tsx`.
- `src/components/marketplace/` — `MarketplaceFeed.tsx`, `CreatePackModal.tsx`.
- `src/app/` — `/` (public arcade feed), `/endless` (procedural infinite mode), `/marketplace` (creator asset store), `/login`, `/register`, `/upload`, `/studio`, `/studio/[id]`, `/dashboard`, `/play/[id]`.
- `src/components/game/StatusBadges.tsx` — Renders active elemental status badges (`🔥 Burn`, `❄️ Freeze`, `🧪 Poison`) and turn counters on the hero and floor enemies.
- `prisma/schema.prisma` — Added `Follow` model (`@@unique([followerId, followingId])`) for creator subscriptions.
- `src/actions/follows.ts` — `toggleFollowCreator(creatorId)` server action to follow or unfollow a creator.
- `src/components/social/FollowButton.tsx` — Interactive Follow/Following toggle button with live follower count.
- `src/app/creator/[id]/page.tsx` — Public Creator Profile page displaying published dungeons, asset packs, total plays, and upvotes.
- `src/app/creator/[id]/page.tsx` — Public Creator Profile page showcasing published dungeons, published pixel-art asset packs, total plays, total upvotes, and `<FollowButton />`.
- `src/app/page.tsx` — Added `feed=following` tab filter on the Home Arcade feed so logged-in players can browse dungeons by creators they follow.
- `src/lib/rpg/schema.ts` — Expanded item types (`"potion" | "weapon" | "armor" | "helmet" | "boots" | "ring"`) across chests, starter items, and merchant shops.
- `src/lib/rpg/gear-perks.ts` — Defines unique passive perks per equipment slot (Elemental Weapon, Thorns Armor, Eagle-Eye Helmet, Swift Boots, Lifesteal/Greed Ring) and calculates auto-sell Gold values.
- `src/lib/rpg/npc-actions.ts` — Extracted NPC shop purchase, quest acceptance, and quest reward claim handlers from `useGameStore.ts`.
- `src/components/game/EquipmentPanel.tsx` — Upgraded to 5 equipment slots (`weapon`, `armor`, `helmet`, `boots`, `ring`) displaying slot perk tooltips and **Equip / Sell for Gold** buttons.
- `src/lib/rpg/melee-combat.ts` & `src/lib/rpg/turn-resolver.ts` — Integrated active slot perks (`Ring` Lifesteal & +50% Gold Greed, `Armor` +2 Thorns reflect, `Boots` 15% Dodge).
- `src/components/studio/ItemTypeSelect.tsx` — Shared 6-option item dropdown (`potion`, `weapon`, `armor`, `helmet`, `boots`, `ring`) used across Studio class starter items, chests, and merchant shops.
- `src/components/upload/` — `JsonCardStudio.tsx`, `JsonMetaCard.tsx`, `JsonHeroCard.tsx`, `JsonFloorsCard.tsx` (interactive card-based JSON builder & two-way raw JSON editor at `/upload`).
- `src/components/upload/JsonFloorEntities.tsx` — Extracted enemy and chest list editors from `JsonFloorsCard.tsx`.
- `src/components/upload/JsonCardStudio.tsx` — Unified two-way JSON Card Builder & Raw JSON Editor with `.json` file import, live Zod validation, Test Play modal, and one-click Arcade publishing.

## 3. Formatting Rule for AI Assistant
- Keep all generated code blocks concise (under ~120 lines per block) and split large components into small helper files so code blocks never truncate or break formatting.
- Never overwrite `BLUEPRINT.md` with shortened summaries—always provide append-only delta updates.

## 4. Build Roadmap & Status
- [x] **Phases 0–7:** Core Arcade MVP (Auth, Zod Schema, JSON Upload, Zustand Engine, Play UI, Home Feed, Seed)
- [x] **Phases 8–11:** Creator Studio (`isPublic` flag, Live Test Mode modal, No-Code Visual Map Builder at `/studio`, Creator `/dashboard`)
- [x] **Phases 12–15:** Custom Grid Sizes (8–24), Upvotes & Comments, Fog of War Exploration Mode, Loot Chests & Consumable Potions
- [x] **Phase 16:** Player Customizations (Creator-defined Melee & Ranged classes, starter items, pre-game Hero Select screen, custom player names, Studio Class Builder)
- [x] **Phase 17:** Procedural "Endless Dungeon" Mode (`/endless` with infinite scaling depths & full-floor clear requirement)
- [x] **Phase 18:** Equipment Slots & Weapon/Armor Swapping (`EquipmentPanel.tsx`)
- [x] **Phase 19:** Custom Tile & Sprite Theme Packs (`themes.ts`, `SpriteDisplay.tsx`) + In-Browser 16×16 Pixel Art Drawer & Uploader (`PixelArtModal.tsx`)
- [x] **Phase 20:** Creator Asset Pack Marketplace (`/marketplace`, Arcade Coins, `CreatePackModal.tsx`, `OwnedPacksBar.tsx`)
- [x] **Phase 21:** Earn Arcade Coins by Playing & Clearing Dungeons (`src/actions/rewards.ts`, `CoinReward` model)
- [x] **Phase 22:** Interactive NPCs, Merchants & Story Dialogue (`NpcInteractionModal.tsx`, `NpcInspectorCard.tsx`)
- [x] **Phase 23:** Mid-Run Save & Resume Slots (`GameSave` & `EndlessSave` models, `SaveRunControls.tsx`, `EndlessClientShell.tsx`)
- [x] **Phase 24:** Quests & NPC Reward Chains (`quest-helpers.ts`, `QuestTrackerCard.tsx`, `NpcQuestEditor.tsx`)
- [x] **Phase 25:** Signature Class Skills & Cooldowns (`[Q]` Key) (`skill-resolver.ts`, `ClassSkillEditor.tsx`)
- [x] **Phase 26:** Elemental Damage & Status Effects (Poison, Burn, Freeze) completed (`elemental-helpers.ts`, `melee-combat.ts`, `StatusBadges.tsx`, Studio element selectors).
- [x] **Phase 27:** Creator Profile Pages & "Follow Creator" Feed completed (`src/app/creator/[id]/page.tsx`, `FollowButton.tsx`, Home Arcade `following` filter).
- [x] **Phase 28:** 5-Slot Equipment System with Unique Slot Perks & Auto-Sell for Run Gold completed.
- [x] **Phase 29:** Interactive JSON Card Builder & Two-Way Raw JSON Editor (`/upload`) completed.
