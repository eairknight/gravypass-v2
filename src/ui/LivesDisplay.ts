import gsap from 'gsap';
import { MAX_LIVES } from '../config';

export class LivesDisplay {
  private hearts: HTMLElement[] = [];

  constructor() {
    for (let i = 0; i < MAX_LIVES; i++) {
      const el = document.getElementById(`heart${i}`);
      if (el) this.hearts.push(el);
    }
  }

  update(lives: number): void {
    this.hearts.forEach((h, i) => {
      if (i < lives) {
        h.style.opacity = '1';
        h.style.transform = 'scale(1)';
      } else {
        // Animate heart loss
        gsap.to(h, {
          opacity: 0.2, scale: 0.5, duration: 0.3,
          ease: 'back.in(2)',
        });
      }
    });
  }

  reset(): void {
    this.hearts.forEach(h => {
      h.style.opacity = '1';
      h.style.transform = 'scale(1)';
    });
  }
}
