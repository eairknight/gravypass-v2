import { Graphics, Container } from 'pixi.js';
import type { Particle } from '../types';
import { ObjectPool } from '../core/ObjectPool';
import { rnd, hexToNum } from '../utils/math';

const SPLASH_COLORS_GOOD = [0x7C3AED, 0xEC4899, 0xFBBF24, 0x84CC16, 0x06B6D4];
const SPLASH_COLORS_BAD = [0xEF4444, 0xF97316, 0xFF0090];
const CONFETTI_COLORS = [0xFBBF24, 0xEC4899, 0x7C3AED, 0x06B6D4, 0x84CC16, 0xFFFFFF];

export class ParticleSystem {
  container: Container;
  private gfx: Graphics;
  private pool: ObjectPool<Particle>;

  constructor() {
    this.container = new Container();
    this.gfx = new Graphics();
    this.container.addChild(this.gfx);

    this.pool = new ObjectPool<Particle>(
      () => ({
        x: 0, y: 0, vx: 0, vy: 0, gravity: 0,
        radius: 3, color: 0xFFFFFF, alpha: 1, decay: 2,
        alive: false,
      }),
      (p) => {
        p.alpha = 1;
        p.alive = true;
        p.ring = false;
        p.confetti = false;
      },
      200,
      500,
    );
  }

  /** Burst of particles on successful tap */
  splash(x: number, y: number, good: boolean): void {
    const colors = good ? SPLASH_COLORS_GOOD : SPLASH_COLORS_BAD;
    const count = good ? 18 : 12;

    for (let i = 0; i < count; i++) {
      const p = this.pool.acquire();
      const angle = (Math.PI * 2 / count) * i + rnd(-0.15, 0.15);
      const speed = rnd(150, 400);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.gravity = good ? 600 : 0;
      p.radius = rnd(2, 5);
      p.color = colors[i % colors.length];
      p.decay = rnd(1.8, 3.0);
    }

    // Extra gravy blobs for good taps
    if (good) {
      for (let i = 0; i < 5; i++) {
        const p = this.pool.acquire();
        const angle = rnd(0, Math.PI * 2);
        const speed = rnd(60, 180);
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.gravity = 400;
        p.radius = rnd(4, 8);
        p.color = 0x7C3AED;
        p.decay = rnd(2.5, 3.5);
      }
    }
  }

  /** Expanding ring on missed tap */
  ring(x: number, y: number): void {
    const p = this.pool.acquire();
    p.x = x;
    p.y = y;
    p.vx = 0;
    p.vy = 0;
    p.gravity = 0;
    p.radius = 10;
    p.color = 0xFFFFFF;
    p.decay = 3;
    p.ring = true;
  }

  /** Big confetti burst for milestones */
  confettiBurst(x: number, y: number, count = 60): void {
    for (let i = 0; i < count; i++) {
      const p = this.pool.acquire();
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(200, 600);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.gravity = 300;
      p.radius = rnd(3, 7);
      p.color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      p.decay = rnd(0.8, 1.5);
      p.confetti = true;
      p.wobblePhase = rnd(0, Math.PI * 2);
      p.wobbleSpeed = rnd(5, 12);
    }
  }

  /** Coin shower for golden plate */
  coinShower(x: number, y: number): void {
    for (let i = 0; i < 25; i++) {
      const p = this.pool.acquire();
      p.x = x + rnd(-40, 40);
      p.y = y;
      p.vx = rnd(-100, 100);
      p.vy = rnd(-500, -200);
      p.gravity = 500;
      p.radius = rnd(3, 6);
      p.color = 0xFFD700;
      p.decay = rnd(1.0, 1.8);
    }
  }

  /** Red burst for life loss */
  lifeLostBurst(x: number, y: number): void {
    for (let i = 0; i < 25; i++) {
      const p = this.pool.acquire();
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(100, 350);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.gravity = 200;
      p.radius = rnd(3, 6);
      p.color = 0xEF4444;
      p.decay = rnd(2.0, 3.5);
    }
  }

  /** Sparkle effect for power-up */
  powerUpSparkle(x: number, y: number, color: number): void {
    for (let i = 0; i < 15; i++) {
      const p = this.pool.acquire();
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(100, 300);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.gravity = 100;
      p.radius = rnd(2, 5);
      p.color = color;
      p.decay = rnd(2.0, 3.0);
    }
  }

  update(dt: number): void {
    this.gfx.clear();

    this.pool.forEach(p => {
      // Physics
      p.vx *= 1 - dt * 2; // drag
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;

      // Confetti flutter
      if (p.confetti && p.wobblePhase !== undefined && p.wobbleSpeed !== undefined) {
        p.x += Math.sin(p.wobblePhase) * 40 * dt;
        p.wobblePhase += p.wobbleSpeed * dt;
      }

      // Ring expand
      if (p.ring) {
        p.radius += 200 * dt;
      }

      if (p.alpha <= 0) {
        this.pool.release(p);
        return;
      }

      // Draw
      if (p.ring) {
        this.gfx.circle(p.x, p.y, p.radius);
        this.gfx.stroke({ color: p.color, width: 2, alpha: p.alpha });
      } else {
        this.gfx.circle(p.x, p.y, p.radius);
        this.gfx.fill({ color: p.color, alpha: p.alpha });
      }
    });
  }

  clear(): void {
    this.pool.releaseAll();
    this.gfx.clear();
  }
}
