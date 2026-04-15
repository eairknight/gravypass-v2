export class HapticManager {
  private supported: boolean;

  constructor() {
    this.supported = 'vibrate' in navigator;
  }

  tap(): void {
    this.vibrate([15]);
  }

  bomb(): void {
    this.vibrate([50, 30, 80]);
  }

  lifeLost(): void {
    this.vibrate([100, 50, 100, 50, 100]);
  }

  levelUp(): void {
    this.vibrate([30, 20, 30, 20, 50]);
  }

  powerUp(): void {
    this.vibrate([10, 10, 10, 10, 30]);
  }

  combo(): void {
    this.vibrate([20, 10, 20, 10, 40]);
  }

  gameOver(): void {
    this.vibrate([200]);
  }

  milestone(): void {
    this.vibrate([30, 20, 30, 20, 30, 20, 60]);
  }

  private vibrate(pattern: number[]): void {
    if (this.supported) {
      try { navigator.vibrate(pattern); } catch { /* silent */ }
    }
  }
}
