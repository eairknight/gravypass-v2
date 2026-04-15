import gsap from 'gsap';
import { formatCurrency } from '../utils/math';

export class GameOverOverlay {
  el: HTMLElement;
  private winningsEl: HTMLElement;
  private walletAmountEl: HTMLElement;
  private onAddWallet: () => void;
  private onRetry: () => void;

  constructor(onAddWallet: () => void, onRetry: () => void) {
    this.onAddWallet = onAddWallet;
    this.onRetry = onRetry;
    this.el = document.getElementById('goOv')!;
    this.winningsEl = document.getElementById('goWinnings')!;
    this.walletAmountEl = document.getElementById('goWalletAmount')!;

    document.getElementById('goWalletBtn')!.addEventListener('click', () => this.onAddWallet());
    document.getElementById('goRetryBtn')!.addEventListener('click', () => this.onRetry());
  }

  show(winnings: number): void {
    const formatted = formatCurrency(winnings);
    this.winningsEl.textContent = formatted;
    this.walletAmountEl.textContent = formatted;
    this.el.style.display = 'flex';

    gsap.fromTo(this.el,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
    );

    // Big money slam
    gsap.fromTo(this.winningsEl,
      { scale: 0.3, rotation: -5 },
      { scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)', delay: 0.15 },
    );

    // Pulse the CTA button
    gsap.fromTo(document.getElementById('goWalletBtn')!,
      { scale: 0.8 },
      { scale: 1, duration: 0.5, ease: 'back.out(2)', delay: 0.4 },
    );
  }

  hide(): void {
    gsap.to(this.el, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => { this.el.style.display = 'none'; },
    });
  }
}
