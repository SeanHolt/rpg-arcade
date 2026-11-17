"use client";

type Props = {
  sprite: string;
  alt?: string;
  sizeClass?: string;
  textClass?: string;
};

export function SpriteDisplay({
  sprite,
  alt = "sprite",
  sizeClass = "h-7 w-7",
  textClass = "text-lg",
}: Props) {
  if (sprite.startsWith("data:image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={sprite}
        alt={alt}
        style={{ imageRendering: "pixelated" }}
        className={`${sizeClass} object-contain select-none`}
      />
    );
  }

  return <span className={`${textClass} leading-none select-none`}>{sprite}</span>;
}
