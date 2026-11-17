import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { RpgBlueprintSchema } from "../src/lib/rpg/schema";
import { SAMPLE_DUNGEON } from "../src/lib/rpg/sample-dungeon";
import { SHOWCASE_DUNGEON } from "../src/lib/rpg/showcase-dungeon";

const connectionString = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding JSON RPG Arcade database...");

  const hashedPassword = await bcrypt.hash("arcade123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "architect@rpgarcade.dev" },
    update: {},
    create: {
      name: "DungeonArchitect",
      email: "architect@rpgarcade.dev",
      password: hashedPassword,
    },
  });

  const blueprints = [
    { data: SAMPLE_DUNGEON, initialPlays: 42 },
    { data: SHOWCASE_DUNGEON, initialPlays: 128 },
  ];

  for (const item of blueprints) {
    const validated = RpgBlueprintSchema.parse(item.data);

    const existing = await prisma.game.findFirst({
      where: {
        title: validated.title,
        authorId: demoUser.id,
      },
    });

    if (!existing) {
      await prisma.game.create({
        data: {
          title: validated.title,
          description: validated.description,
          difficulty: validated.difficulty,
          floorCount: validated.floors.length,
          gameData: JSON.stringify(validated),
          playCount: item.initialPlays,
          authorId: demoUser.id,
        },
      });
      console.log(`✅ Created game: "${validated.title}"`);
    } else {
      console.log(`⏭️ Skipped existing game: "${validated.title}"`);
    }
  }

  console.log("🎉 Seed complete! Demo login: architect@rpgarcade.dev / arcade123");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
