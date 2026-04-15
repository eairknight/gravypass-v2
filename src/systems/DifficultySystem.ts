import { LEVELS, LEVEL_DURATION_S, getEndlessConfig, type LevelConfig } from '../config';
import type { EventBus } from '../core/EventBus';

export class DifficultySystem {
  level = 0;
  levelTimer = 0;         // seconds into current level
  private bus: EventBus;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  reset(): void {
    this.level = 0;
    this.levelTimer = 0;
  }

  getConfig(): LevelConfig {
    if (this.level < LEVELS.length) return LEVELS[this.level];
    return getEndlessConfig(this.level);
  }

  update(dt: number): void {
    this.levelTimer += dt;
    if (this.levelTimer >= LEVEL_DURATION_S) {
      this.levelTimer = 0;
      this.level++;
      const cfg = this.getConfig();
      this.bus.emit('level:up', { level: this.level, label: cfg.label });
    }
  }

  /** Progress through current level, 0..1 */
  get progress(): number {
    return Math.min(this.levelTimer / LEVEL_DURATION_S, 1);
  }

  /** Spawn interval in seconds (converted from frame count at 60fps) */
  get spawnInterval(): number {
    return this.getConfig().interval / 60;
  }
}
