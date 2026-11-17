import { z } from "zod";
export const ItemTypeEnum = z.enum([
  "potion",
  "weapon",
  "armor",
  "helmet",
  "boots",
  "ring",
]);
export type RpgItemType = z.infer<typeof ItemTypeEnum>;
export const ElementTypeSchema = z.enum(["none", "fire", "ice", "venom"]).default("none");

const CoordinateSchema = z.object({
  x: z.number().int().min(0).max(49),
  y: z.number().int().min(0).max(49),
});

export const StarterItemSchema = z.object({
  itemType: ItemTypeEnum.default("weapon"),
  itemName: z.string().min(1).max(40),
  value: z.number().int().min(1).max(999),
  element: ElementTypeSchema
});

export const ClassSkillSchema = z.object({
  name: z.string().min(1).max(30),
  type: z.enum(["cleave", "piercing_shot", "mend", "blink"]),
  cooldown: z.number().int().min(1).max(12).default(4),
});
const SpriteFieldSchema = z
  .string()
  .min(1)
  .max(12000, "Sprite image data is too large (keep pixel art under 12KB)")
  .refine(
    (val) => val.length <= 8 || val.startsWith("data:image/png;base64,"),
    "Sprite must be an emoji or a PNG data URL.",
  );

export const HeroClassSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(30),
  sprite: SpriteFieldSchema.default("🧙"),
  description: z.string().max(160).default(""),
  combatType: z.enum(["melee", "ranged"]).default("melee"),
  range: z.number().int().min(1).max(5).default(1),
  maxHp: z.number().int().min(10).max(9999).default(100),
  atk: z.number().int().min(1).max(999).default(16),
  def: z.number().int().min(0).max(999).default(5),
  starterItems: z.array(StarterItemSchema).max(5).default([]),
  skill: ClassSkillSchema.optional(),
  element: ElementTypeSchema,
});
export const EnemySchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(40),
  sprite: z.string().min(1).max(8).default("👾"),
  x: z.number().int().min(0).max(49),
  y: z.number().int().min(0).max(49),
  hp: z.number().int().min(1).max(9999),
  atk: z.number().int().min(1).max(999),
  def: z.number().int().min(0).max(999).default(0),
  xpReward: z.number().int().min(0).max(5000).default(10),
  isBoss: z.boolean().default(false),
  element: ElementTypeSchema,
});

export const ChestSchema = z.object({
  id: z.string().min(1).max(40),
  x: z.number().int().min(0).max(49),
  y: z.number().int().min(0).max(49),
  itemType: ItemTypeEnum.default("weapon"),
  itemName: z.string().min(1).max(40),
  value: z.number().int().min(1).max(999),
  element: ElementTypeSchema,
});

export const StairwaySchema = z.object({
  from: CoordinateSchema,
  toFloorId: z.string().min(1).max(40),
  to: CoordinateSchema,
  label: z.string().max(60).optional(),
});
export const ShopItemSchema = z.object({
  id: z.string().min(1).max(40),
  itemType: ItemTypeEnum.default("weapon"),
  itemName: z.string().min(1).max(40),
  value: z.number().int().min(1).max(999),
  goldCost: z.number().int().min(1).max(9999),
  element: ElementTypeSchema,
});
export const NpcQuestSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().min(1).max(60),
  goalType: z.enum(["kill_enemies", "open_chests"]),
  targetCount: z.number().int().min(1).max(50),
  rewardGold: z.number().int().min(0).max(5000).default(30),
  rewardXp: z.number().int().min(0).max(5000).default(40),
  rewardItem: StarterItemSchema.optional(),
});

export const NpcSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(40),
  sprite: SpriteFieldSchema.default("🧙‍♂️"),
  x: z.number().int().min(0).max(49),
  y: z.number().int().min(0).max(49),
  role: z.enum(["story", "merchant"]).default("story"),
  dialogue: z.string().min(1).max(400),
  shopItems: z.array(ShopItemSchema).max(6).default([]),
  quest: NpcQuestSchema.optional(),
});
export const FloorSchema = z
  .object({
    id: z.string().min(1).max(40),
    name: z.string().min(1).max(60),
    grid: z
      .array(
        z
          .string()
          .min(5, "Map width must be at least 5 tiles")
          .max(40, "Map width cannot exceed 40 tiles")
          .regex(
            /^[#.SH]+$/,
            "Grid can only contain '#', '.', 'S', or 'H' tiles",
          ),
      )
      .min(5, "Map height must be at least 5 tiles")
      .max(40, "Map height cannot exceed 40 tiles"),
    enemies: z.array(EnemySchema).max(50).default([]),
    chests: z.array(ChestSchema).max(30).default([]),
    npcs: z.array(NpcSchema).max(20).default([]),
    stairways: z.array(StairwaySchema).max(20).default([]),
  })
  .refine(
    (floor) => {
      const width = floor.grid.at(0)?.length ?? 0;
      return width > 0 && floor.grid.every((row) => row.length === width);
    },
    { message: "Every row in a floor grid must have the exact same width." },
  );

export const CustomSpritesSchema = z
  .object({
    wall: SpriteFieldSchema.optional(),
    floor: SpriteFieldSchema.optional(),
    stairs: SpriteFieldSchema.optional(),
    shrine: SpriteFieldSchema.optional(),
    chest: SpriteFieldSchema.optional(),
  })
  .default({});
export const RpgBlueprintSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(80),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500),
    difficulty: z.enum(["Easy", "Normal", "Hard"]).default("Normal"),
    theme: z.enum(["crypt", "scifi", "pirate", "magma"]).default("crypt"),
    customSprites: CustomSpritesSchema,
    fogOfWar: z.boolean().default(false),
    visionRadius: z.number().int().min(1).max(6).default(2),
    player: z.object({
      name: z.string().min(1).max(30).default("Hero"),
      sprite: z.string().min(1).max(8).default("🧙"),
      startFloorId: z.string().min(1),
      startX: z.number().int().min(0),
      startY: z.number().int().min(0),
      maxHp: z.number().int().min(10).max(9999).default(100),
      atk: z.number().int().min(1).max(999).default(15),
      def: z.number().int().min(0).max(999).default(5),
    }),
    classes: z.array(HeroClassSchema).max(6).default([]),
    floors: z
      .array(FloorSchema)
      .min(1, "Dungeon must have at least 1 floor")
      .max(15, "Dungeon cannot exceed 15 floors"),
  })
  .superRefine((data, ctx) => {
    const floorMap = new Map(data.floors.map((f) => [f.id, f]));

    if (floorMap.size !== data.floors.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "All floors must have unique IDs.",
      });
      return;
    }

    const hasBoss = data.floors.some((f) => f.enemies.some((e) => e.isBoss));
    if (!hasBoss) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Your RPG must include at least one enemy with 'isBoss: true'.",
      });
    }

    const isWalkable = (floorId: string, x: number, y: number): boolean => {
      const floor = floorMap.get(floorId);
      if (!floor) return false;
      const tile = floor.grid.at(y)?.at(x);
      return tile !== undefined && tile !== "#";
    };

    if (!floorMap.has(data.player.startFloorId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Player startFloorId "${data.player.startFloorId}" does not exist.`,
      });
    } else if (
      !isWalkable(
        data.player.startFloorId,
        data.player.startX,
        data.player.startY,
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Player starting coordinates must land on a walkable tile.",
      });
    }

    for (const floor of data.floors) {
      for (const enemy of floor.enemies) {
        if (!isWalkable(floor.id, enemy.x, enemy.y)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Enemy "${enemy.name}" on floor "${floor.id}" is out of bounds or in a wall.`,
          });
        }
      }

      for (const chest of floor.chests) {
        if (!isWalkable(floor.id, chest.x, chest.y)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Chest "${chest.itemName}" on floor "${floor.id}" is out of bounds or in a wall.`,
          });
        }
      }
      for (const npc of floor.npcs) {
        if (!isWalkable(floor.id, npc.x, npc.y)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `NPC "${npc.name}" on floor "${floor.id}" is out of bounds or in a wall.`,
          });
        }
      }

      for (const stairs of floor.stairways) {
        if (!isWalkable(floor.id, stairs.from.x, stairs.from.y)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Stairway origin (${stairs.from.x}, ${stairs.from.y}) on floor "${floor.id}" is invalid.`,
          });
        }
        if (!floorMap.has(stairs.toFloorId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Stairway on floor "${floor.id}" points to unknown floor "${stairs.toFloorId}".`,
          });
        } else if (!isWalkable(stairs.toFloorId, stairs.to.x, stairs.to.y)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Stairway destination (${stairs.to.x}, ${stairs.to.y}) on "${stairs.toFloorId}" is invalid.`,
          });
        }
      }
    }
  });
export type ElementType = z.infer<typeof ElementTypeSchema>;
export type RpgBlueprint = z.infer<typeof RpgBlueprintSchema>;
export type RpgHeroClass = z.infer<typeof HeroClassSchema>;
export type RpgStarterItem = z.infer<typeof StarterItemSchema>;
export type RpgFloor = z.infer<typeof FloorSchema>;
export type RpgEnemy = z.infer<typeof EnemySchema>;
export type RpgChest = z.infer<typeof ChestSchema>;
export type RpgStairway = z.infer<typeof StairwaySchema>;
export type RpgNpc = z.infer<typeof NpcSchema>;
export type RpgShopItem = z.infer<typeof ShopItemSchema>;
export type RpgNpcQuest = z.infer<typeof NpcQuestSchema>;
export type RpgClassSkill = z.infer<typeof ClassSkillSchema>;