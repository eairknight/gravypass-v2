import { MAX_LIVES, INVINCIBILITY_MS } from '../config';
import type { EventBus } from '../core/EventBus';

export class LivesSystem {
  lives = MAX_LIVES;
  invincible = false;
  private invTimer: number | null = null;
  private bus: EventBus;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  reset(): void {
    this.lives = MAX_LIVES;
    this.invincible = false;
    if (this.invTimer !== null) clearTimeout(this.invTimer);
    this.invTimer = null;
  }

  loseLife(): boolean {
    if (this.invincible) return false;
    this.lives = Math.max(0, this.lives - 1);
    this.bus.emit('life:lost', { remaining: this.lives });

    if (this.lives > 0) {
      this.invincible = true;
      this.invTimer = window.setTimeout(() => {
        this.invincible = false;
        this.invTimer = null;
      }, INVINCIBILITY_MS);
    }

    return this.lives <= 0; // returns true if game over
  }

  /** Clear invincibility timer (call on game over) */
  cleanup(): void {
    if (this.invTimer !== null) {
      clearTimeout(this.invTimer);
      this.invTimer = null;
    }
    this.invincible = false;
  }

  get hasShield(): boolean {
    return false; // overridden by power-up system
  }
}
