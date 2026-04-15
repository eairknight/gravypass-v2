export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
  private running = false;
  private updateFn: (dt: number) => void;

  constructor(updateFn: (dt: number) => void) {
    this.updateFn = updateFn;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    const rawDt = (now - this.lastTime) / 1000;
    // Clamp dt to prevent physics explosions on tab-return
    const dt = Math.min(Math.max(rawDt, 0.001), 0.1);
    this.lastTime = now;
    this.updateFn(dt);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
