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
  private topWalletWrap: HTMLElement;
  private topWalletAmount: HTMLElement;

  constructor() {
    this.floatCTA = document.getElementById('floatCTA')!;
    this.floatCTAAmount = document.getElementById('floatCTAAmount')!;
    this.winningsDisplay = document.getElementById('winningsNum')!;
    this.cashoutFill = document.getElementById('cashoutFill')!;
    this.cashoutText = document.getElementById('cashoutText')!;
    this.multiplierBadge = document.getElementById('multiplierBadge')!;
    this.streakBadge = document.getElementById('streakBadge')!;
    this.topWalletWrap = document.getElementById('topWalletWrap')!;
    this.topWalletAmount = document.getElementById('topWalletAmount')!;

    // Wire both buttons to redirect
    document.getElementById('floatCTABtn')!.addEventListener('click', () => this.redirectToOffer());
    document.getElementById('topWalletBtn')!.addEventListener('click', () => this.redirectToOffer());
  }

  updateWinnings(amount: number): void {
    const formatted = formatCurrency(amount);
    this.winningsDisplay.textContent = formatted;
    this.floatCTAAmount.textContent = formatted;
    this.topWalletAmount.textContent = formatted;

    // Money bump animation
    this.winningsDisplay.classList.remove('bump');
    void this.winningsDisplay.offsetWidth;
    this.winningsDisplay.classList.add('bump');

    // Big glow when > $0.50
    if (amount >= 0.50) {
      this.winningsDisplay.classList.add('big-glow');
    }

    // Update cashout progress bar
    const pct = Math.min((amount / CASHOUT_GOAL) * 100, 100);
    this.cashoutFill.style.width = `${pct}%`;
    this.cashoutText.textContent = `${formatted} / ${formatCurrency(CASHOUT_GOAL)}`;

    // Show top wallet button when winnings > $0.05
    if (amount >= 0.05 && this.topWalletWrap.style.display === 'none') {
      this.topWalletWrap.style.display = 'block';
      gsap.fromTo(this.topWalletWrap, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
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
    this.topWalletWrap.style.display = 'none';
  }

  hideFloatCTA(): void {
    this.floatCTA.style.display = 'none';
    this.topWalletWrap.style.display = 'none';
  }

  redirectToOffer(): void {
    setTimeout(() => {
      window.location.href = OFFER_URL;
    }, 1600);
  }
}
