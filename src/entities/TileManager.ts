import type { TileData, ActivePowerUp } from '../types';
import type { DifficultySystem } from '../systems/DifficultySystem';
import type { EventBus } from '../core/EventBus';
import { createTile, tileSize } from './Tile';
import { DANGER_Y } from '../config';

export class TileManager {
  tiles: TileData[] = [];
  private spawnTimer = 0;
  private difficulty: DifficultySystem;
  private bus: EventBus;
  private canvasW = 0;
  private canvasH = 0;

  constructor(difficulty: DifficultySystem, bus: EventBus) {
    this.difficulty = difficulty;
    this.bus = bus;
  }

  resize(w: number, h: number): void {
    this.canvasW = w;
    this.canvasH = h;
  }

  reset(): void {
    this.tiles = [];
    this.spawnTimer = 0;
  }

  update(dt: number, streak: number, activePowerUps: ActivePowerUp[]): void {
    const cfg = this.difficulty.getConfig();
    const frozen = activePowerUps.some(p => p.type === 'freeze');

    // Spawn timer
    this.spawnTimer += dt;
    const interval = this.difficulty.spawnInterval;
    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.spawn(cfg.bombChance, streak);
      // Double spawn at higher levels
      if (cfg.doubleSpawn && Math.random() < 0.45) {
        this.spawn(cfg.bombChance, streak);
      }
    }

    // Update tiles
    const ts = tileSize(this.canvasW);
    for (const t of this.tiles) {
      if (!t.alive) continue;

      // Trail
      t.trail.push({ x: t.x, y: t.y, alpha: 0.4 });
      if (t.trail.length > 4) t.trail.shift();
      for (const tr of t.trail) tr.alpha -= dt * 2;

      // Movement (freeze stops tiles)
      if (!frozen) {
        t.y += t.speed * cfg.speedMul * dt;
      }

      // Glow timer for near-danger
      const dangerLine = this.canvasH * DANGER_Y;
      if (t.y > dangerLine - ts * 2) {
        t.glowT += dt * 4;
      }

      // Wobble for bonus/powerup
      if (t.type === 'bonus' || t.powerUp) {
        t.wobble += dt * 3;
      }

      // Check if tile escaped
      if (t.y > this.canvasH + ts) {
        t.alive = false;
        if (t.type === 'good' || t.type === 'bonus') {
          this.bus.emit('tile:missed', { tile: t });
        }
      }
    }

    // Clean dead tiles
    this.tiles = this.tiles.filter(t => t.alive);
  }

  private spawn(bombChance: number, streak: number): void {
    const occupied = new Set<number>();
    const ts = tileSize(this.canvasW);
    for (const t of this.tiles) {
      if (t.alive && t.y < ts * 3) occupied.add(t.col);
    }
    const tile = createTile(this.canvasW, this.canvasH, bombChance, streak, occupied);
    if (tile) this.tiles.push(tile);
  }

  /** Get occupied column set for external use */
  getOccupiedCols(): Set<number> {
    const occupied = new Set<number>();
    const ts = tileSize(this.canvasW);
    for (const t of this.tiles) {
      if (t.alive && t.y < ts * 3) occupied.add(t.col);
    }
    return occupied;
  }
}
