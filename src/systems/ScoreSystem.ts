import {
  BASE_WIN, WIN_PER_STREAK, MAX_WIN_PER_TAP, MULTIPLIER_PER_STREAK,
  BONUS_MULTIPLIER, COMBO_WINDOW_MS, COMBO_TIERS, MILESTONES,
} from '../config';
import type { EventBus } from '../core/EventBus';
import type { TileData } from '../types';

export class ScoreSystem {
  streak = 0;
  multiplier = 1;
  winnings = 0;
  walletTotal = 0;
  combo = 0;
  private lastTapTime = 0;
  private bus: EventBus;
  private hitMilestones = new Set<number>();

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  reset(): void {
    this.streak = 0;
    this.multiplier = 1;
    this.winnings = 0;
    this.combo = 0;
    this.lastTapTime = 0;
    this.hitMilestones.clear();
  }

  scoreTap(tile: TileData, hasDoubleScore: boolean, frenzyMultiplier = 1): number {
    this.streak++;
    this.multiplier = 1 + this.streak * MULTIPLIER_PER_STREAK;

    // Combo tracking
    const now = performance.now();
    if (now - this.lastTapTime < COMBO_WINDOW_MS) {
      this.combo++;
    } else {
      this.combo = 1;
    }
    this.lastTapTime = now;

    // Base gain
    let gain = Math.min(BASE_WIN + (this.streak - 1) * WIN_PER_STREAK, MAX_WIN_PER_TAP);

    // Bonus tile
    if (tile.type === 'bonus') gain *= BONUS_MULTIPLIER;

    // Double score power-up
    if (hasDoubleScore) gain *= 2;

    // Combo bonus
    const comboBonus = this.getComboBonus();
    gain *= comboBonus;

    // Frenzy mode bonus
    if (frenzyMultiplier > 1) gain *= frenzyMultiplier;

    gain = parseFloat(gain.toFixed(2));
    this.winnings = parseFloat((this.winnings + gain).toFixed(2));

    // Emit events
    this.bus.emit('tile:tapped', { tile, gain, combo: this.combo });

    if (this.streak % 3 === 0) {
      this.bus.emit('streak:milestone', { streak: this.streak });
    }
    if (this.combo > 1 && this.combo % 5 === 0) {
      this.bus.emit('combo:milestone', { combo: this.combo });
    }

    // Check milestones
    for (const m of MILESTONES) {
      if (this.winnings >= m && !this.hitMilestones.has(m)) {
        this.hitMilestones.add(m);
        this.bus.emit('score:milestone', { amount: m });
      }
    }

    return gain;
  }

  breakStreak(): void {
    this.streak = Math.max(0, this.streak - 1);
    this.multiplier = 1 + this.streak * MULTIPLIER_PER_STREAK;
    this.combo = 0;
  }

  addToWallet(): number {
    const amount = this.winnings;
    this.walletTotal = parseFloat((this.walletTotal + amount).toFixed(2));
    this.bus.emit('wallet:add', { amount });
    this.winnings = 0;
    this.streak = 0;
    this.multiplier = 1;
    this.combo = 0;
    return amount;
  }

  private getComboBonus(): number {
    for (const tier of COMBO_TIERS) {
      if (this.combo >= tier.min && this.combo <= tier.max) return tier.bonus;
    }
    return 1;
  }
}
