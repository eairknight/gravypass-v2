import gsap from 'gsap';
import {
  CASHOUT_POPUP_INTERVAL_S,
  CASHOUT_POPUP_AMOUNTS,
  CASHOUT_POPUP_NAMES,
  MILESTONES,
} from '../config';
import { pick } from '../utils/math';
import type { EventBus } from '../core/EventBus';

/** Fake "someone just cashed out" popups for social proof */
export class LivePopups {
  private liveCashout: HTMLElement;
  private lcName: HTMLElement;
  private lcAmount: HTMLElement;
  private milestonePopup: HTMLElement;
  private msMsg: HTMLElement;
  private frenzyOverlay: HTMLElement;
  private popupTimer: ReturnType<typeof setInterval> | null = null;
  private lastMilestone = -1;

  constructor(private bus: EventBus) {
    this.liveCashout = document.getElementById('liveCashout')!;
    this.lcName = document.getElementById('lcName')!;
    this.lcAmount = document.getElementById('lcAmount')!;
    this.milestonePopup = document.getElementById('milestonePopup')!;
    this.msMsg = document.getElementById('msMsg')!;
    this.frenzyOverlay = document.getElementById('frenzyOverlay')!;
  }

  /** Start showing fake cashout popups at interval */
  startPopups(): void {
    this.stopPopups();
    // Show first one after a few seconds
    setTimeout(() => this.showCashoutPopup(), 4000);
    this.popupTimer = setInterval(() => {
      this.showCashoutPopup();
    }, CASHOUT_POPUP_INTERVAL_S * 1000);
  }

  stopPopups(): void {
    if (this.popupTimer) {
      clearInterval(this.popupTimer);
      this.popupTimer = null;
    }
    this.liveCashout.style.display = 'none';
    this.frenzyOverlay.style.display = 'none';
  }

  private showCashoutPopup(): void {
    this.lcName.textContent = pick(CASHOUT_POPUP_NAMES);
    this.lcAmount.textContent = pick(CASHOUT_POPUP_AMOUNTS);
    this.liveCashout.style.display = 'flex';

    gsap.fromTo(this.liveCashout,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' },
    );

    gsap.to(this.liveCashout, {
      x: -100, opacity: 0, duration: 0.4, delay: 4,
      onComplete: () => { this.liveCashout.style.display = 'none'; },
    });
  }

  /** Check if winnings crossed a milestone */
  checkMilestone(winnings: number): void {
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (winnings >= MILESTONES[i] && i > this.lastMilestone) {
        this.lastMilestone = i;
        this.showMilestone(MILESTONES[i]);
        break;
      }
    }
  }

  private showMilestone(amount: number): void {
    this.msMsg.textContent = `YOU HIT $${amount.toFixed(2)}!`;
    this.milestonePopup.style.display = 'block';

    gsap.fromTo(this.milestonePopup,
      { scale: 0.3, opacity: 0, rotation: -5 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)' },
    );

    gsap.to(this.milestonePopup, {
      scale: 0.8, opacity: 0, duration: 0.4, delay: 2.5,
      onComplete: () => { this.milestonePopup.style.display = 'none'; },
    });

    this.bus.emit('milestone:reached', { amount });
  }

  /** Show/hide frenzy mode overlay */
  showFrenzy(show: boolean): void {
    if (show) {
      this.frenzyOverlay.style.display = 'block';
      gsap.fromTo(this.frenzyOverlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
      );
    } else {
      gsap.to(this.frenzyOverlay, {
        opacity: 0, duration: 0.3,
        onComplete: () => { this.frenzyOverlay.style.display = 'none'; },
      });
    }
  }

  resetMilestones(): void {
    this.lastMilestone = -1;
    this.milestonePopup.style.display = 'none';
    this.frenzyOverlay.style.display = 'none';
  }
}
