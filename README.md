# ⚔️ JSON RPG Arcade

> **Build, share, mod, and play 2D roguelike dungeon crawlers directly in your browser—powered by structured JSON blueprints, a No-Code Visual Studio, and an in-browser 16×16 Pixel Art Marketplace.**

![Next.js 16](https://shields.io)
![TypeScript](https://shields.io)
![Prisma v7](https://shields.io)
![Zustand](https://shields.io)
![Tailwind CSS v4](https://shields.io)

---

## 🌟 Why JSON RPG Arcade?

Most browser RPG makers lock your games behind proprietary binary formats or require heavy desktop engines. **JSON RPG Arcade** treats every game as a portable, human-readable, Zod-validated JSON blueprint—while giving creators two seamless ways to build:

1. **No-Code Visual Dungeon Studio (`/studio`):** Paint multi-floor dungeons (8×8 up to 24×24), place monsters, bosses, chests, healing shrines, stairways, and interactive NPCs, draw custom 16×16 pixel sprites, and live-test your dungeon with a single click.
2. **Interactive JSON Card Studio & Uploader (`/upload`):** Build or edit games using structured Visual Cards with two-way sync to Raw JSON, or import/export `.json` files directly.

---

## 🎮 Core Gameplay Features

### 🧙 Custom Hero Classes & Signature Skills (`[Q]`)
* **Creator-Defined Classes:** Dungeons can offer up to 6 distinct playable classes (e.g., *Iron Vanguard*, *Rift Arcanist*, *Shadowblade*) with custom portraits, starting gear, and custom player names.
* **Melee & Ranged Combat:** Fight adjacent foes with bump-combat (`WASD` / Arrow Keys) or snipe targets from up to 5 tiles away (`[Space]` or click-to-target).
* **Signature Class Abilities (`[Q]`):** Trigger turn-cooldown active skills in battle:
  * **Cleave:** Hits all adjacent enemies simultaneously.
  * **Piercing Shot:** Deals `1.3×` armor-ignoring ranged damage.
  * **Mend:** Restores 35% of Max HP without spending a potion.
  * **Blink:** Teleports 2 tiles across the dungeon to escape danger or flank bosses.

### 🛡️ 5-Slot Equipment System & Auto-Sell Economy
Equip, compare, and upgrade gear across **5 distinct equipment slots**, each granting a unique passive combat effect:
* **⚔️ Weapon:** Boosts **ATK** and inflicts **Elemental Status Effects** (`Fire`, `Ice`, `Venom`).
* **🛡️ Armor:** Boosts **DEF** + **Thorns** (reflects `+2` damage back to attackers).
* **🪖 Helmet:** Boosts **DEF** + **Eagle Eye** (`+1` Ranged attack distance).
* **👢 Boots:** Boosts **DEF** + **Swift Step** (`15%` chance to dodge counter-attacks).
* **💍 Ring:** Boosts **ATK** + **Vampiric Greed** (`+3 HP` Lifesteal per hit & `+50%` bonus Gold).
* **Smart Auto-Sell:** Replacing equipped gear or looting weaker duplicates automatically converts unused items into **Run Gold** so you can immediately shop at dungeon merchants.

### 🔥 Elemental Affinities & Status Effects
Weapons, classes, and monsters can carry elemental traits that trigger tactical statuses:
* **🔥 Fire (Burn):** Deals `4` damage per turn for 3 turns.
* **❄️ Ice (Freeze):** Stuns the target for 1 turn so they skip their counter-attack.
* **🧪 Venom (Poison):** Deals `3` damage per turn for 4 turns.

### 💬 Interactive NPCs, Merchants & Quests
* **Story NPCs:** Deliver lore, puzzle clues, and world-building dialogue popups.
* **In-Dungeon Merchants:** Spend Run Gold earned from monsters and auto-sold gear to buy potions and enchanted equipment mid-run.
* **Side Quests & Reward Chains:** Accept quests from NPCs (*Defeat X Enemies* or *Open X Chests*), track live progress in your HUD sidebar, and turn them in for Gold, XP, and rare gear.

### ♾️ Procedural Endless Abyss (`/endless`)
* Infinitely scaling procedural room-and-corridor dungeons where every depth grows larger and deadlier.
* Clear every monster and loot every chest on a floor to unlock the descent to the next depth while keeping your hero's level, stats, potions, and gear.

### 💾 Mid-Run Cloud & Local Save Slots
* **Community Dungeons:** Logged-in players can save mid-run progress to SQLite (`GameSave`) and resume from any floor later.
* **Endless Mode:** Logged-in players get cloud save slots (`EndlessSave`), while guest players get automatic browser `localStorage` save slots.

---

## 🎨 Creator Economy & Pixel Art Marketplace

### 🖌️ Built-In 16×16 Pixel Art Studio & Genre Themes
* Choose from 4 curated genre themes (**Classic Crypt**, **Sci-Fi Station**, **Pirate Cove**, **Magma Cavern**).
* Draw custom 16×16 pixel sprites directly in the browser—or upload any PNG/JPG to auto-convert it into crisp pixelated sprites for walls, floors, chests, shrines, heroes, enemies, and NPCs.

### 🪙 Arcade Coins & Asset Store (`/marketplace`)
* **Play to Earn:** Players earn **Arcade Coins** automatically by clearing community dungeons (`+25` Coins first clear, `+5` repeat clears) and conquering Endless depths (`+10` Coins per depth).
* **Create & Sell Asset Packs:** Pixel artists can bundle custom tile overrides and up to 8 character/monster sprites into named **Asset Packs**, set a price in Arcade Coins (or list them for Free), earn coins whenever other creators unlock their packs, and apply unlocked packs in `/studio` with one click.

---

## 🌐 Community & Social Features
* **Creator Profile Pages (`/creator/[id]`):** Showcase published dungeons, pixel-art asset packs, total plays, and total upvotes.
* **Follow Creators:** Subscribe to favorite dungeon builders and filter the Home Arcade feed by **Following Creators** (`/?feed=following`).
* **Upvotes, Comments & Play Counters:** Full community engagement on every published dungeon (`/play/[id]`).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, `cacheComponents`, Server Actions) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 (Dark Mode Arcade UI) |
| **Database & ORM** | SQLite + Prisma ORM v7 (`@prisma/adapter-better-sqlite3`) |
| **Authentication** | Auth.js v5 (`next-auth@beta`, JWT Sessions, `bcryptjs`) |
| **Game & Editor State** | Zustand (`useGameStore` & `useEditorStore`) |
| **Schema Validation** | Zod (`RpgBlueprintSchema` & `CreateAssetPackSchema`) |

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/SeanHolt/rpg-arcade
cd rpg-arcade
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="replace-with-a-random-32-character-secret-key"
```
*(You can generate an `AUTH_SECRET` anytime with `npx auth secret`.)*

### 3. Initialize the SQLite Database & Seed Starter Dungeons
```bash
npx prisma db push
npx prisma generate
npx prisma db seed
```

### 4. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to browse the Arcade, enter the **Endless Abyss**, open **Visual Studio**, or publish a **Pixel Art Pack**!

---

## 📐 RPG Blueprint JSON Format

Every dungeon is validated against `RpgBlueprintSchema` (`src/lib/rpg/schema.ts`). Here is a minimal example of a playable dungeon blueprint:

```json
{
  "title": "The Ember Vault",
  "description": "Brave the scorched halls and defeat the Flame Warden.",
  "difficulty": "Normal",
  "theme": "magma",
  "fogOfWar": true,
  "visionRadius": 2,
  "player": {
    "name": "Ashen Knight",
    "sprite": "🧙",
    "startFloorId": "floor-1",
    "startX": 1,
    "startY": 1,
    "maxHp": 110,
    "atk": 18,
    "def": 5
  },
  "classes": [
    {
      "id": "pyromancer",
      "name": "Ember Blade",
      "sprite": "🔥",
      "description": "Wields fire-infused steel and an area Cleave skill.",
      "combatType": "melee",
      "range": 1,
      "maxHp": 105,
      "atk": 19,
      "def": 4,
      "element": "fire",
      "skill": { "name": "Flame Cleave", "type": "cleave", "cooldown": 4 },
      "starterItems": [
        { "itemType": "potion", "itemName": "Crimson Draught", "value": 40, "element": "none" }
      ]
    }
  ],
  "floors": [
    {
      "id": "floor-1",
      "name": "Scorched Vestibule",
      "grid": [
        "##########",
        "#........#",
        "#.##..H..#",
        "#........#",
        "#...##...#",
        "#........#",
        "##########"
      ],
      "enemies": [
        {
          "id": "boss-1",
          "name": "Flame Warden",
          "sprite": "👹",
          "x": 8,
          "y": 5,
          "hp": 95,
          "atk": 20,
          "def": 5,
          "xpReward": 150,
          "isBoss": true,
          "element": "fire"
        }
      ],
      "chests": [
        {
          "id": "chest-1",
          "x": 2,
          "y": 4,
          "itemType": "ring",
          "itemName": "Bloodstone Band",
          "value": 2,
          "element": "none"
        }
      ],
      "npcs": [],
      "stairways": []
    }
  ]
}
```

### Tile Legend

| Character | Tile Type | Behavior |
| :---: | :--- | :--- |
| `#` | **Wall** | Solid obstacle that blocks movement and vision |
| `.` | **Floor** | Walkable dungeon tile |
| `H` | **Healing Shrine** | Restores 50% Max HP and cleanses Burn/Poison/Freeze once per run |
| `S` | **Stairway** | Teleports the player to the linked coordinates on another floor |

---

## 🤝 Contributing

Contributions, custom starter dungeons, and new gameplay mechanics are welcome!
1. Fork the repository and create a feature branch (`git checkout -b feature/amazing-mechanic`).
2. Keep components modular and run `npm run build` to ensure zero TypeScript or Next.js prerender errors.
