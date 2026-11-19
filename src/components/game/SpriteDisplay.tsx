"use client";

import { useEffect, useState } from "react";

type Props = {
  sprite: string;
  frame2?: string;
  alt?: string;
  sizeClass?: string;
  textClass?: string;
};

export function SpriteDisplay({
  sprite,
  frame2,
  alt = "sprite",
  sizeClass = "h-7 w-7",
  textClass = "text-xl",
}: Props) {
  const [tick, setTick] = useState(false);

  useEffect(() => {
    if (!frame2) return;
    const timer = setInterval(() => setTick((t) => !t), 650);
    return () => clearInterval(timer);
  }, [frame2]);

  const activeSprite = frame2 && tick ? frame2 : sprite;

  if (activeSprite.startsWith("data:image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={activeSprite}
        alt={alt}
        className={`${sizeClass} object-contain [image-rendering:pixelated]`}
      />
    );
  }

  return <span className={`${textClass} leading-none select-none`}>{activeSprite}</span>;
}
