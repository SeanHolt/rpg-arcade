import type { RpgBlueprint, RpgChest, RpgEnemy, RpgFloor } from "./schema";

const MONSTER_POOL = [
  { name: "Crypt Rat", sprite: "🐀", baseHp: 22, baseAtk: 8, baseDef: 1, xp: 15 },
  { name: "Cave Goblin", sprite: "👺", baseHp: 30, baseAtk: 11, baseDef: 2, xp: 22 },
  { name: "Bone Archer", sprite: "💀", baseHp: 36, baseAtk: 14, baseDef: 3, xp: 28 },
  { name: "Shadow Stalker", sprite: "👻", baseHp: 44, baseAtk: 17, baseDef: 4, xp: 35 },
  { name: "Stone Golem", sprite: "🗿", baseHp: 60, baseAtk: 19, baseDef: 6, xp: 45 },
];

const BOSS_POOL = [
  { name: "Abyssal Warden", sprite: "👹" },
  { name: "Dread Lich", sprite: "👑" },
  { name: "Void Wyrm", sprite: "🐉" },
  { name: "Infernal Titan", sprite: "🔥" },
];

const LOOT_POOL: Omit<RpgChest, "id" | "x" | "y">[] = [
  { itemType: "potion", itemName: "Crimson Draught", value: 45, element: "none" },
  { itemType: "weapon", itemName: "Blazing Edge", value: 3, element: "fire" },
  { itemType: "weapon", itemName: "Frostbite Blade", value: 3, element: "ice" },
  { itemType: "weapon", itemName: "Viper Fang", value: 3, element: "venom" },
  { itemType: "armor", itemName: "Mithril Mail", value: 2, element: "none" },
  { itemType: "helmet", itemName: "Hawkeye Visor", value: 2, element: "none" },
  { itemType: "boots", itemName: "Windwalker Treads", value: 2, element: "none" },
  { itemType: "ring", itemName: "Bloodstone Band", value: 2, element: "none" },
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateEndlessFloor(depth: number): {
  floor: RpgFloor;
  spawnX: number;
  spawnY: number;
} {
  const width = Math.min(20, 12 + Math.floor(depth / 2));
  const height = Math.min(18, 10 + Math.floor(depth / 2));

  // Start filled with walls
  const cells: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => "#")
  );

  // Carve 4 to 6 random rectangular rooms and connect their centers
  const roomCenters: { x: number; y: number }[] = [];
  const roomCount = randInt(4, 6);

  for (let i = 0; i < roomCount; i++) {
    const rw = randInt(3, 5);
    const rh = randInt(3, 4);
    const rx = randInt(1, width - rw - 1);
    const ry = randInt(1, height - rh - 1);

    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        cells[y][x] = ".";
      }
    }

    const cx = Math.floor(rx + rw / 2);
    const cy = Math.floor(ry + rh / 2);

    if (roomCenters.length > 0) {
      const prev = roomCenters.at(-1)!;
      let curX = prev.x;
      let curY = prev.y;
      while (curX !== cx) {
        cells[curY][curX] = ".";
        curX += curX < cx ? 1 : -1;
      }
      while (curY !== cy) {
        cells[curY][curX] = ".";
        curY += curY < cy ? 1 : -1;
      }
    }

    roomCenters.push({ x: cx, y: cy });
  }

  const spawn = roomCenters.at(0)!;
  const bossRoom = roomCenters.at(-1)!;

  // Collect all open floor tiles excluding spawn and boss tile
  const openTiles: { x: number; y: number }[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (cells[y][x] === "." && !(x === spawn.x && y === spawn.y) && !(x === bossRoom.x && y === bossRoom.y)) {
        openTiles.push({ x, y });
      }
    }
  }

  // Shuffle open tiles
  openTiles.sort(() => Math.random() - 0.5);

  // Place 1 Healing Shrine ('H')
  const shrineTile = openTiles.pop();
  if (shrineTile) {
    cells[shrineTile.y][shrineTile.x] = "H";
  }

  // Place 2 Loot Chests
  const chests: RpgChest[] = [];
  for (let i = 0; i < 2; i++) {
    const pos = openTiles.pop();
    if (!pos) break;
    const template = LOOT_POOL[randInt(0, LOOT_POOL.length - 1)];
    chests.push({
      id: `endless-chest-${depth}-${i}`,
      x: pos.x,
      y: pos.y,
      itemType: template.itemType,
      itemName: `${template.itemName} +${depth}`,
      value: template.value + Math.floor(depth / 2),
      element: template.element,
    });
  }

  // Place scaling Monsters + 1 Floor Guardian Boss
  const scale = 1 + (depth - 1) * 0.25;
  const enemies: RpgEnemy[] = [];
  const enemyCount = Math.min(openTiles.length, 3 + Math.floor(depth / 2));

  for (let i = 0; i < enemyCount; i++) {
    const pos = openTiles.pop()!;
    const tpl = MONSTER_POOL[randInt(0, MONSTER_POOL.length - 1)];
    enemies.push({
      id: `endless-mob-${depth}-${i}`,
      name: tpl.name,
      sprite: tpl.sprite,
      x: pos.x,
      y: pos.y,
      hp: Math.round(tpl.baseHp * scale),
      atk: Math.round(tpl.baseAtk * scale),
      def: Math.round(tpl.baseDef * scale),
      xpReward: Math.round(tpl.xp * scale),
      isBoss: false,
      element: "none",
    });
  }

  const bossTpl = BOSS_POOL[(depth - 1) % BOSS_POOL.length];
  enemies.push({
    id: `endless-boss-${depth}`,
    name: `${bossTpl.name} (Depth ${depth})`,
    sprite: bossTpl.sprite,
    x: bossRoom.x,
    y: bossRoom.y,
    hp: Math.round(75 * scale),
    atk: Math.round(17 * scale),
    def: Math.round(5 * scale),
    xpReward: Math.round(80 * scale),
    isBoss: true,
    element: depth % 2 === 0 ? "ice" : "fire",
  });

  return {
    floor: {
      id: `depth-${depth}`,
      name: `Endless Abyss — Depth ${depth}`,
      grid: cells.map((r) => r.join("")),
      enemies,
      npcs: [],
      chests,
      stairways: [],
    },
    spawnX: spawn.x,
    spawnY: spawn.y,
  };
}

export function createEndlessBlueprint(): RpgBlueprint {
  const { floor, spawnX, spawnY } = generateEndlessFloor(1);

  return {
    title: "The Endless Abyss",
    description:
      "Descend infinitely into procedurally generated depths. Each defeated guardian unlocks the next floor while keeping your hero's level, stats, and potions!",
    difficulty: "Normal",
    fogOfWar: true,
    visionRadius: 2,
    theme: "crypt", customSprites: {},
    player: {
      name: "Abyss Walker",
      sprite: "🧙",
      startFloorId: floor.id,
      startX: spawnX,
      startY: spawnY,
      maxHp: 110,
      atk: 17,
      def: 5,
    },
    classes: [
      {
        id: "vanguard",
        name: "Iron Vanguard",
        sprite: "🛡️",
        description: "Armored melee bruiser with extra healing supplies.",
        combatType: "melee",
        range: 1,
        maxHp: 130,
        atk: 17,
        def: 7,
        element: "none",
        starterItems: [{ itemType: "potion", itemName: "Vanguard Elixir", value: 45, element: "none" }],
      },
      {
        id: "arcanist",
        name: "Rift Arcanist",
        sprite: "🏹",
        description: "Ranged spell-archer capable of striking from 3 tiles away.",
        combatType: "ranged",
        range: 3,
        maxHp: 95,
        atk: 20,
        def: 4,
        element: "none",
        starterItems: [
          { itemType: "weapon", itemName: "Rift Bow", value: 2, element: "none" },
          { itemType: "potion", itemName: "Minor Potion", value: 35, element: "none" },
        ],
      },
    ],
    floors: [floor],
  };
}
