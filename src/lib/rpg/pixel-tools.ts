export const GRID_DIM = 16;

export function createEmptyPixelGrid(): string[] {
  return Array(GRID_DIM * GRID_DIM).fill("");
}

export function cloneGrid(grid: string[]): string[] {
  return [...grid];
}

export function floodFillGrid(
  grid: string[],
  startIdx: number,
  replacementColor: string
): string[] {
  const targetColor = grid[startIdx] ?? "";
  if (targetColor === replacementColor) return grid;

  const next = [...grid];
  const visited = new Uint8Array(GRID_DIM * GRID_DIM);
  const queue: number[] = [startIdx];
  visited[startIdx] = 1;

  while (queue.length > 0) {
    const idx = queue.shift()!;
    next[idx] = replacementColor;

    const x = idx % GRID_DIM;
    const y = Math.floor(idx / GRID_DIM);
    const neighbors = [
      y > 0 ? idx - GRID_DIM : -1,
      y < GRID_DIM - 1 ? idx + GRID_DIM : -1,
      x > 0 ? idx - 1 : -1,
      x < GRID_DIM - 1 ? idx + 1 : -1,
    ];

    for (const n of neighbors) {
      if (n >= 0 && !visited[n] && (next[n] ?? "") === targetColor) {
        visited[n] = 1;
        queue.push(n);
      }
    }
  }

  return next;
}

export function flipGridHorizontal(grid: string[]): string[] {
  const next = createEmptyPixelGrid();
  for (let y = 0; y < GRID_DIM; y++) {
    for (let x = 0; x < GRID_DIM; x++) {
      next[y * GRID_DIM + (GRID_DIM - 1 - x)] = grid[y * GRID_DIM + x] ?? "";
    }
  }
  return next;
}

export function flipGridVertical(grid: string[]): string[] {
  const next = createEmptyPixelGrid();
  for (let y = 0; y < GRID_DIM; y++) {
    for (let x = 0; x < GRID_DIM; x++) {
      next[(GRID_DIM - 1 - y) * GRID_DIM + x] = grid[y * GRID_DIM + x] ?? "";
    }
  }
  return next;
}

export function rotateGrid90(grid: string[]): string[] {
  const next = createEmptyPixelGrid();
  for (let y = 0; y < GRID_DIM; y++) {
    for (let x = 0; x < GRID_DIM; x++) {
      next[x * GRID_DIM + (GRID_DIM - 1 - y)] = grid[y * GRID_DIM + x] ?? "";
    }
  }
  return next;
}

export function renderGridToDataUrl(grid: string[]): string {
  const canvas = document.createElement("canvas");
  canvas.width = GRID_DIM;
  canvas.height = GRID_DIM;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  grid.forEach((hex, idx) => {
    if (!hex) return;
    ctx.fillStyle = hex;
    ctx.fillRect(idx % GRID_DIM, Math.floor(idx / GRID_DIM), 1, 1);
  });

  return canvas.toDataURL("image/png");
}
