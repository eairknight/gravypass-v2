import { TICKER_NAMES, TICKER_ACTIONS } from '../config';
import { pick, rnd, rndInt } from '../utils/math';

export class Ticker {
  private inner: HTMLElement;
  private interval: number | null = null;

  constructor() {
    this.inner = document.getElementById('tickerInner')!;
    this.populate();
  }

  private populate(): void {
    const items: string[] = [];
    for (let i = 0; i < 12; i++) {
      items.push(this.generateItem());
    }
    const html = items.map(t => `<span class="tick-item">${t}</span>`).join('');
    this.inner.innerHTML = html + html; // duplicate for seamless loop
  }

  private generateItem(): string {
    const name = pick(TICKER_NAMES);
    const amt = rnd(2, 15).toFixed(2);
    const streak = rndInt(8, 35);
    const action = pick(TICKER_ACTIONS);
    return action(name, amt, streak);
  }

  startRotation(): void {
    // Periodically refresh items
    this.interval = window.setInterval(() => {
      this.populate();
    }, 25000);
  }

  destroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}
