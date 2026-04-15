import type { EventBus } from '../core/EventBus';
import {
  JACKPOT_CHANCE_PER_TAP, JACKPOT_MIN_STREAK,
  JACKPOT_AMOUNTS, JACKPOT_WEIGHTS,
  HOT_STREAK_THRESHOLD, FIRE_STREAK_THRESHOLD, MEGA_STREAK_THRESHOLD,
  LUCKY_SPIN_STREAK, NEAR_WIN_CHANCE, JACKPOT_MESSAGES,
} from '../config';
import { pick } from '../utils/math';

export type StreakTier = 'none' | 'hot' | 'fire' | 'mega';

export class CasinoSystem {
  private bus: EventBus;
  lastJackpotAmount = 0;
  currentTier: StreakTier = 'none';
  private lastSpinStreak = 0;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  reset(): void {
    this.lastJackpotAmount = 0;
    this.currentTier = 'none';
    this.lastSpinStreak = 0;
  }

  /** Call after every successful tap. Returns jackpot amount if triggered, 0 otherwise */
  checkJackpot(streak: number): number {
    if (streak < JACKPOT_MIN_STREAK) return 0;
    if (Math.random() > JACKPOT_CHANCE_PER_TAP) {
      // Near-miss tease
      if (Math.random() < NEAR_WIN_CHANCE) {
        this.bus.emit('casino:nearmiss');
      }
      return 0;
    }

    const amount = this.weightedPick(JACKPOT_AMOUNTS, JACKPOT_WEIGHTS);
    this.lastJackpotAmount = amount;
    const message = pick(JACKPOT_MESSAGES);
    this.bus.emit('casino:jackpot', { amount, message });
    return amount;
  }

  /** Update streak tier and emit events on tier changes */
  updateStreakTier(streak: number): void {
    let newTier: StreakTier = 'none';
    if (streak >= MEGA_STREAK_THRESHOLD) newTier = 'mega';
    else if (streak >= FIRE_STREAK_THRESHOLD) newTier = 'fire';
    else if (streak >= HOT_STREAK_THRESHOLD) newTier = 'hot';

    if (newTier !== this.currentTier) {
      this.currentTier = newTier;
      if (newTier !== 'none') {
        this.bus.emit('casino:tierchange', { tier: newTier });
      }
    }

    // Lucky spin every N streaks
    if (streak > 0 && streak % LUCKY_SPIN_STREAK === 0 && streak !== this.lastSpinStreak) {
      this.lastSpinStreak = streak;
      this.bus.emit('casino:luckyspin', { streak });
    }
  }

  /** Get border color for current streak tier */
  getTierColor(): number {
    switch (this.currentTier) {
      case 'hot': return 0xF97316;
      case 'fire': return 0xEF4444;
      case 'mega': return 0xFFD700;
      default: return 0;
    }
  }

  getTierLabel(): string {
    switch (this.currentTier) {
      case 'hot': return 'HOT STREAK';
      case 'fire': return 'ON FIRE';
      case 'mega': return 'MEGA STREAK';
      default: return '';
    }
  }

  private weightedPick(items: number[], weights: number[]): number {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }
}
