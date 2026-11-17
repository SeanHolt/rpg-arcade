import { z } from "zod";

const SpriteValue = z
  .string()
  .min(1)
  .max(12000)
  .refine(
    (val) => val.length <= 8 || val.startsWith("data:image/png;base64,"),
    "Sprite must be an emoji or PNG data URL."
  );

export const PackSpritesPayloadSchema = z.object({
  tiles: z
    .object({
      wall: SpriteValue.optional(),
      floor: SpriteValue.optional(),
      stairs: SpriteValue.optional(),
      shrine: SpriteValue.optional(),
      chest: SpriteValue.optional(),
    })
    .default({}),
  entities: z
    .array(
      z.object({
        label: z.string().min(1).max(30),
        sprite: SpriteValue,
      })
    )
    .max(8)
    .default([]),
});

export const CreateAssetPackSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(60),
  description: z.string().trim().min(5, "Description is too short").max(300),
  price: z.number().int().min(0).max(5000),
  sprites: PackSpritesPayloadSchema,
});

export type PackSpritesPayload = z.infer<typeof PackSpritesPayloadSchema>;
