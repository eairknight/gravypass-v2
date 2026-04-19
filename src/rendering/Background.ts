import { Graphics, Container, Text, TextStyle } from 'pixi.js';
import { COLS, DANGER_Y, COLORS } from '../config';
import { colX, tileSize } from '../entities/Tile';
import { rnd, hexToNum } from '../utils/math';

interface Spark {
  x: number;
  y: number;
  alpha: number;
  speed: number;
  size: number;
}

export class Background {
  container: Container;
  private bg: Graphics;
  private lanes: Graphics;
  private dangerLine: Graphics;
  private dangerText: Text;
  private sparks: Spark[] = [];
  private sparkGfx: Graphics;
  private speedLines: Graphics;
  private w = 0;
  private h = 0;

  constructor() {
    this.container = new Container();
    this.bg = new Graphics();
    this.lanes = new Graphics();
    this.dangerLine = new Graphics();
    this.sparkGfx = new Graphics();
    this.speedLines = new Graphics();

    this.dangerText = new Text({
      text: 'DON\'T LET THEM FALL',
      style: new TextStyle({
        fontFamily: 'Poppins',
        fontSize: 11,
        fontWeight: '700',
        fill: 0xFF4444,
        letterSpacing: 2,
      }),
    });
    this.dangerText.anchor.set(0.5);

    this.container.addChild(this.bg, this.lanes, this.sparkGfx, this.speedLines, this.dangerLine, this.dangerText);
  }

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.drawStatic();
    // Initialize sparks
    this.sparks = [];
    for (let i = 0; i < 30; i++) {
      this.sparks.push({
        x: rnd(0, w),
        y: rnd(0, h * 0.85),
        alpha: rnd(0.1, 0.5),
        speed: rnd(0.3, 1.0),
        size: rnd(1, 3),
      });
    }
  }

  private drawStatic(): void {
    // Background gradient
    this.bg.clear();
    this.bg.rect(0, 0, this.w, this.h);
    this.bg.fill({ color: hexToNum(COLORS.bg1) });

    // Lane guides
    this.lanes.clear();
    const ts = tileSize(this.w);
    for (let c = 0; c < COLS; c++) {
      const x = colX(c, this.w);
      this.lanes.moveTo(x, 0);
      this.lanes.lineTo(x, this.h);
      this.lanes.stroke({ color: 0x3FC1E4, width: ts * 0.04, alpha: 0.05 });
    }

    // Danger line
    const dy = this.h * DANGER_Y;
    this.dangerLine.clear();
    this.dangerLine.moveTo(0, dy);
    this.dangerLine.lineTo(this.w, dy);
    this.dangerLine.stroke({ color: 0xFF1744, width: 2, alpha: 0.5 });

    this.dangerText.x = this.w / 2;
    this.dangerText.y = dy + 14;
  }

  update(dt: number, level: number): void {
    this.sparkGfx.clear();
    for (const s of this.sparks) {
      s.alpha += Math.sin(performance.now() * 0.001 * s.speed) * dt * 0.5;
      s.alpha = Math.max(0.05, Math.min(0.6, s.alpha));
      this.sparkGfx.circle(s.x, s.y, s.size);
      this.sparkGfx.fill({ color: 0x3FC1E4, alpha: s.alpha * 0.7 });
    }

    // Speed lines at level 4+
    this.speedLines.clear();
    if (level >= 4) {
      const intensity = Math.min((level - 3) * 0.04, 0.15);
      for (let i = 0; i < 8; i++) {
        const x = rnd(0, this.w);
        const y = rnd(0, this.h);
        const len = rnd(20, 60);
        this.speedLines.moveTo(x, y);
        this.speedLines.lineTo(x, y + len);
        this.speedLines.stroke({ color: 0x3FC1E4, width: 1, alpha: intensity });
      }
    }
  }
}
