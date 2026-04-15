import type { ActivePowerUp, PowerUpType, TileData } from '../types';
import type { EventBus } from '../core/EventBus';
import { POWERUP_DURATIONS } from '../config';

export class PowerUpManager {
  active: ActivePowerUp[] = [];
  shieldActive = false;
  private bus: EventBus;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  reset(): void {
    this.active = [];
    this.shieldActive = false;
  }

  activate(tile: TileData): void {
    if (!tile.powerUp) return;
    const type = tile.powerUp;
    const duration = POWERUP_DURATIONS[type];

    if (type === 'shield') {
      this.shieldActive = true;
    }

    if (type === 'golden') {
      // Golden plate is instant, handled by score system
      this.bus.emit('powerup:activated', { type });
      return;
    }

    // Check if already active — refresh duration
    const existing = this.active.find(p => p.type === type);
    if (existing) {
      existing.remaining = duration;
      existing.duration = duration;
    } else {
      this.active.push({ type, remaining: duration, duration });
    }

    this.bus.emit('powerup:activated', { type });
  }

  update(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      if (p.type === 'shield') continue; // shield doesn't decay with time
      p.remaining -= dt;
      if (p.remaining <= 0) {
        this.bus.emit('powerup:expired', { type: p.type });
        this.active.splice(i, 1);
      }
    }
  }

  consumeShield(): boolean {
    if (!this.shieldActive) return false;
    this.shieldActive = false;
    const idx = this.active.findIndex(p => p.type === 'shield');
    if (idx >= 0) {
      this.active.splice(idx, 1);
      this.bus.emit('powerup:expired', { type: 'shield' });
    }
    return true;
  }

  has(type: PowerUpType): boolean {
    return this.active.some(p => p.type === type);
  }
}
