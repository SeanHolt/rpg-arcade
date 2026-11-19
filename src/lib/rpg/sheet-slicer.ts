export function sliceImageToSprites(
  img: HTMLImageElement,
  cellSize = 16,
  maxSprites = 24
): string[] {
  const cols = Math.max(1, Math.floor(img.width / cellSize));
  const rows = Math.max(1, Math.floor(img.height / cellSize));

  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.imageSmoothingEnabled = false;
  const results: string[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (results.length >= maxSprites) return results;

      ctx.clearRect(0, 0, 16, 16);
      ctx.drawImage(
        img,
        c * cellSize,
        r * cellSize,
        cellSize,
        cellSize,
        0,
        0,
        16,
        16
      );

      const pixels = ctx.getImageData(0, 0, 16, 16).data;
      let hasVisiblePixel = false;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] > 20) {
          hasVisiblePixel = true;
          break;
        }
      }

      if (hasVisiblePixel) {
        results.push(canvas.toDataURL("image/png"));
      }
    }
  }

  return results;
}
