import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { TileData } from '../types';
import { DANGER_Y, WARNING_Y } from '../config';
import { hexToNum } from '../utils/math';

export class TileRenderer {
  container: Container;
  private canvasH = 0;

  constructor() {
    this.container = new Container();
  }

  resize(_w: number, h: number): void {
    this.canvasH = h;
  }

  /** Create PixiJS display objects for a tile */
  createTileDisplay(tile: TileData): void {
    const c = new Container();
    const r = tile.radius;
    const color = hexToNum(tile.color);

    // Outer ring (darker)
    const outer = new Graphics();
    outer.circle(0, 0, r);
    outer.fill({ color: darken(color, 50) });

    // Inner gradient circle
    const inner = new Graphics();
    inner.circle(0, 0, r * 0.88);
    inner.fill({ color });

    // Highlight shine
    const shine = new Graphics();
    shine.circle(-r * 0.2, -r * 0.2, r * 0.45);
    shine.fill({ color: 0xFFFFFF, alpha: 0.2 });

    // Emoji text
    const emoji = new Text({
      text: tile.emoji,
      style: new TextStyle({
        fontSize: r * 0.85,
      }),
    });
    emoji.anchor.set(0.5);

    c.addChild(outer, inner, shine, emoji);

    // TAP ME label (hidden initially)
    const label = new Text({
      text: tile.type === 'bomb' ? "DON'T!" : 'TAP!',
      style: new TextStyle({
        fontFamily: 'Poppins',
        fontSize: r * 0.32,
        fontWeight: '900',
        fill: tile.type === 'bomb' ? 0xFF4444 : 0xFFFFFF,
        stroke: { color: 0x000000, width: 2 },
      }),
    });
    label.anchor.set(0.5);
    label.y = -r * 1.3;
    label.visible = false;
    c.addChild(label);

    // Power-up glow ring
    if (tile.powerUp) {
      const ring = new Graphics();
      ring.circle(0, 0, r * 1.15);
      ring.stroke({ color: 0xFFD700, width: 3, alpha: 0.7 });
      c.addChildAt(ring, 0);
    }

    // Bonus wobble ring
    if (tile.type === 'bonus') {
      const ring = new Graphics();
      ring.circle(0, 0, r * 1.1);
      ring.stroke({ color: 0xFBBF24, width: 2, alpha: 0.5 });
      c.addChildAt(ring, 0);
    }

    c.x = tile.x;
    c.y = tile.y;
    tile.container = c;
    tile.label = label;
    this.container.addChild(c);
  }

  /** Update tile display objects */
  updateTile(tile: TileData, dt: number): void {
    const c = tile.container;
    if (!c) return;

    c.x = tile.x;
    c.y = tile.y;

    // Show TAP! label when near danger
    const warningLine = this.canvasH * WARNING_Y;
    const dangerLine = this.canvasH * DANGER_Y;
    if (tile.label) {
      tile.label.visible = tile.y > warningLine;
      if (tile.y > dangerLine - tile.radius) {
        // Pulse the label
        tile.label.scale.set(1 + Math.sin(tile.glowT * 6) * 0.15);
      }
    }

    // Glow effect near danger
    if (tile.y > warningLine) {
      const intensity = (tile.y - warningLine) / (dangerLine - warningLine);
      c.alpha = 0.7 + Math.sin(tile.glowT * 4) * 0.3 * intensity;
    } else {
      c.alpha = 1;
    }

    // Bonus/power-up wobble
    if (tile.type === 'bonus' || tile.powerUp) {
      c.rotation = Math.sin(tile.wobble) * 0.08;
    }
  }

  /** Remove tile display from stage */
  removeTile(tile: TileData): void {
    if (tile.container) {
      this.container.removeChild(tile.container);
      tile.container.destroy({ children: true });
      tile.container = undefined;
    }
  }

  /** Draw glow trails behind tiles */
  drawTrails(gfx: Graphics, tiles: TileData[]): void {
    gfx.clear();
    for (const t of tiles) {
      if (!t.alive) continue;
      const color = hexToNum(t.color);
      for (const tr of t.trail) {
        if (tr.alpha <= 0) continue;
        gfx.circle(tr.x, tr.y, t.radius * 0.6);
        gfx.fill({ color, alpha: tr.alpha * 0.3 });
      }
    }
  }

  clear(): void {
    this.container.removeChildren();
  }
}

function darken(color: number, amount: number): number {
  const r = Math.max(0, ((color >> 16) & 0xFF) - amount);
  const g = Math.max(0, ((color >> 8) & 0xFF) - amount);
  const b = Math.max(0, (color & 0xFF) - amount);
  return (r << 16) | (g << 8) | b;
}
