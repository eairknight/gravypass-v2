import gsap from 'gsap';
import { OFFER_URL, CASHOUT_GOAL } from '../config';
import { formatCurrency } from '../utils/math';

export class WalletUI {
  private floatCTA: HTMLElement;
  private floatCTAAmount: HTMLElement;
  private winningsDisplay: HTMLElement;
  private cashoutFill: HTMLElement;
  private cashoutText: HTMLElement;
  private multiplierBadge: HTMLElement;
  private streakBadge: HTMLElement;

  constructor() {
    this.floatCTA = document.getElementById('floatCTA')!;
    this.floatCTAAmount = document.getElementById('floatCTAAmount')!;
    this.winningsDisplay = document.getElementById('winningsNum')!;
    this.cashoutFill = document.getElementById('cashoutFill')!;
    this.cashoutText = document.getElementById('cashoutText')!;
    this.multiplierBadge = document.getElementById('multiplierBadge')!;
    this.streakBadge = document.getElementById('streakBadge')!;

    // Wire up float CTA to redirect
    document.getElementById('floatCTABtn')!.addEventListener('click', () => this.redirectToOffer());
  }

  updateWinnings(amount: number): void {
    const formatted = formatCurrency(amount);
    this.winningsDisplay.textContent = formatted;
    this.floatCTAAmount.textContent = formatted;

    // Money bump animation
    this.winningsDisplay.classList.remove('bump');
    void this.winningsDisplay.offsetWidth;
    this.winningsDisplay.classList.add('bump');

    // Big glow when > $1
    if (amount >= 1) {
      this.winningsDisplay.classList.add('big-glow');
    }

    // Update cashout progress bar
    const pct = Math.min((amount / CASHOUT_GOAL) * 100, 100);
    this.cashoutFill.style.width = `${pct}%`;
    this.cashoutText.textContent = `${formatted} / ${formatCurrency(CASHOUT_GOAL)}`;

    // Show float CTA when winnings > $0.30
    if (amount >= 0.30 && this.floatCTA.style.display === 'none') {
      this.floatCTA.style.display = 'flex';
      gsap.fromTo(this.floatCTA, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
    }
  }

  updateMultiplier(mult: number): void {
    this.multiplierBadge.textContent = `${mult.toFixed(2)}x`;
    if (mult >= 2) {
      this.multiplierBadge.style.color = '#FFD700';
      this.multiplierBadge.style.borderColor = 'rgba(255, 215, 0, 0.5)';
    }
  }

  updateStreak(streak: number): void {
    this.streakBadge.textContent = `\u{1F525} ${streak} streak`;
    if (streak >= 10) {
      this.streakBadge.style.color = '#FF1744';
      this.streakBadge.style.borderColor = 'rgba(255, 23, 68, 0.5)';
    }
  }

  reset(): void {
    this.winningsDisplay.textContent = '$0.00';
    this.winningsDisplay.classList.remove('big-glow', 'bump');
    this.cashoutFill.style.width = '0%';
    this.cashoutText.textContent = `$0.00 / ${formatCurrency(CASHOUT_GOAL)}`;
    this.multiplierBadge.textContent = '1.00x';
    this.multiplierBadge.style.color = '';
    this.multiplierBadge.style.borderColor = '';
    this.streakBadge.textContent = '\u{1F525} 0 streak';
    this.streakBadge.style.color = '';
    this.streakBadge.style.borderColor = '';
    this.floatCTA.style.display = 'none';
  }

  hideFloatCTA(): void {
    this.floatCTA.style.display = 'none';
  }

  redirectToOffer(): void {
    setTimeout(() => {
      window.location.href = OFFER_URL;
    }, 1600);
  }
}
