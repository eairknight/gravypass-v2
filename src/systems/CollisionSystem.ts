import type { TileData } from '../types';
import { HIT_PADDING, COLS, COL_MARGIN, COL_USABLE } from '../config';
import { tileSize, colX } from '../entities/Tile';

export class CollisionSystem {
  /**
   * Find which tile (if any) was tapped.
   * Uses column-based lookup for O(k) instead of sorting all tiles.
   */
  hitTest(tx: number, ty: number, tiles: TileData[], canvasW: number): TileData | null {
    // Determine which column the tap is in
    const col = this.getColumn(tx, canvasW);
    if (col < 0) return null;

    const ts = tileSize(canvasW);
    const hitRadius = ts * HIT_PADDING;

    // Check tiles in this column, closest to tap first (bottom-up by y)
    let best: TileData | null = null;
    let bestDist = Infinity;

    for (const t of tiles) {
      if (!t.alive || t.tapped) continue;
      if (t.col !== col) continue;

      const dist = Math.hypot(tx - t.x, ty - t.y);
      if (dist < hitRadius && dist < bestDist) {
        best = t;
        bestDist = dist;
      }
    }

    // Also check adjacent columns if tap is near boundary
    const adjacentCols = this.getAdjacentColumns(tx, canvasW, col);
    for (const adjCol of adjacentCols) {
      for (const t of tiles) {
        if (!t.alive || t.tapped) continue;
        if (t.col !== adjCol) continue;

        const dist = Math.hypot(tx - t.x, ty - t.y);
        if (dist < hitRadius && dist < bestDist) {
          best = t;
          bestDist = dist;
        }
      }
    }

    return best;
  }

  private getColumn(x: number, canvasW: number): number {
    const ts = tileSize(canvasW);
    let bestCol = -1;
    let bestDist = ts * HIT_PADDING;

    for (let c = 0; c < COLS; c++) {
      const cx = colX(c, canvasW);
      const dist = Math.abs(x - cx);
      if (dist < bestDist) {
        bestDist = dist;
        bestCol = c;
      }
    }
    return bestCol;
  }

  private getAdjacentColumns(x: number, canvasW: number, mainCol: number): number[] {
    const cols: number[] = [];
    const margin = canvasW * COL_MARGIN;
    const step = canvasW * COL_USABLE / (COLS - 1);
    const mainX = margin + mainCol * step;
    const threshold = step * 0.35;

    if (x < mainX && mainCol > 0) cols.push(mainCol - 1);
    if (x > mainX && mainCol < COLS - 1) cols.push(mainCol + 1);

    return cols;
  }
}
