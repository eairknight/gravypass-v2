import gsap from 'gsap';
import type { StreakTier } from '../systems/CasinoSystem';

export class CasinoUI {
  private jackpotBanner: HTMLElement;
  private jackpotAmount: HTMLElement;
  private jackpotMsg: HTMLElement;
  private tierGlow: HTMLElement;
  private tierLabel: HTMLElement;
  private nearMiss: HTMLElement;
  private slotDigits: HTMLElement[];

  constructor() {
    this.jackpotBanner = document.getElementById('jackpotBanner')!;
    this.jackpotAmount = document.getElementById('jackpotAmount')!;
    this.jackpotMsg = document.getElementById('jackpotMsg')!;
    this.tierGlow = document.getElementById('tierGlow')!;
    this.tierLabel = document.getElementById('tierLabel')!;
    this.nearMiss = document.getElementById('nearMiss')!;
    this.slotDigits = Array.from(document.querySelectorAll('.slot-digit'));
  }

  /** Show jackpot win banner with slot-machine reveal */
  showJackpot(amount: number, message: string): void {
    this.jackpotMsg.textContent = message;
    this.jackpotAmount.textContent = '+$' + amount.toFixed(2);
    this.jackpotBanner.style.display = 'flex';

    gsap.fromTo(this.jackpotBanner,
      { scale: 0.3, opacity: 0, rotation: -5 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)' },
    );

    // Slot machine digit roll animation
    this.animateSlotRoll(amount);

    // Auto-hide after 2.5s
    gsap.to(this.jackpotBanner, {
      scale: 0.8, opacity: 0, duration: 0.4, delay: 2.5,
      onComplete: () => { this.jackpotBanner.style.display = 'none'; },
    });
  }

  /** Animate the slot-machine style rolling digits */
  private animateSlotRoll(finalAmount: number): void {
    const str = finalAmount.toFixed(2);
    this.slotDigits.forEach((el, i) => {
      const target = str[i] || '0';
      let count = 0;
      const chars = '0123456789$.';
      const interval = setInterval(() => {
        el.textContent = chars[Math.floor(Math.random() * chars.length)];
        count++;
        if (count > 8 + i * 3) {
          clearInterval(interval);
          el.textContent = target;
          // Bounce on land
          gsap.fromTo(el, { scale: 1.4 }, { scale: 1, duration: 0.2, ease: 'back.out(3)' });
        }
      }, 50);
    });
  }

  /** Show near-miss tease ("So close!") */
  showNearMiss(): void {
    this.nearMiss.style.display = 'block';
    gsap.fromTo(this.nearMiss,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3 },
    );
    gsap.to(this.nearMiss, {
      opacity: 0, y: -10, duration: 0.4, delay: 1.2,
      onComplete: () => { this.nearMiss.style.display = 'none'; },
    });
  }

  /** Update the streak tier border glow */
  updateTier(tier: StreakTier): void {
    if (tier === 'none') {
      this.tierGlow.style.display = 'none';
      this.tierLabel.style.display = 'none';
      return;
    }

    const colors: Record<string, string> = {
      hot: '#F97316',
      fire: '#EF4444',
      mega: '#FFD700',
    };
    const labels: Record<string, string> = {
      hot: 'HOT STREAK',
      fire: 'ON FIRE',
      mega: 'MEGA STREAK',
    };

    this.tierGlow.style.display = 'block';
    this.tierGlow.style.boxShadow = `inset 0 0 30px ${colors[tier]}50, 0 0 15px ${colors[tier]}30`;
    this.tierGlow.style.borderColor = colors[tier];

    this.tierLabel.style.display = 'block';
    this.tierLabel.textContent = labels[tier];
    this.tierLabel.style.color = colors[tier];

    // Pulse animation on tier change
    gsap.fromTo(this.tierLabel,
      { scale: 1.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
    );
    gsap.fromTo(this.tierGlow,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
    );
  }

  /** Lucky spin announcement */
  showLuckySpin(): void {
    this.jackpotMsg.textContent = 'LUCKY SPIN!';
    this.jackpotAmount.textContent = 'BONUS ROUND';
    this.jackpotBanner.style.display = 'flex';
    this.jackpotBanner.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.95), rgba(236,72,153,0.95))';

    gsap.fromTo(this.jackpotBanner,
      { scale: 0.5, opacity: 0, rotation: -10 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' },
    );

    gsap.to(this.jackpotBanner, {
      scale: 0.8, opacity: 0, duration: 0.4, delay: 1.8,
      onComplete: () => {
        this.jackpotBanner.style.display = 'none';
        this.jackpotBanner.style.background = '';
      },
    });
  }

  hide(): void {
    this.jackpotBanner.style.display = 'none';
    this.tierGlow.style.display = 'none';
    this.tierLabel.style.display = 'none';
    this.nearMiss.style.display = 'none';
  }
}
