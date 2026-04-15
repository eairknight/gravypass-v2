export type TapCallback = (x: number, y: number) => void;

export class TouchHandler {
  private canvas: HTMLCanvasElement;
  private callback: TapCallback;
  private scaleX = 1;
  private scaleY = 1;

  constructor(canvas: HTMLCanvasElement, callback: TapCallback) {
    this.canvas = canvas;
    this.callback = callback;
    this.bind();
  }

  updateScale(displayW: number, displayH: number, canvasW: number, canvasH: number): void {
    this.scaleX = canvasW / displayW;
    this.scaleY = canvasH / displayH;
  }

  private bind(): void {
    // Touch
    this.canvas.addEventListener('touchstart', this.onTouch, { passive: false });

    // Mouse fallback (for desktop testing)
    this.canvas.addEventListener('click', this.onClick);

    // Prevent all default gestures
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length >= 2) e.preventDefault();
    }, { passive: false });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Prevent pull-to-refresh globally
    document.body.style.overscrollBehavior = 'none';
  }

  private onTouch = (e: TouchEvent): void => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    for (const touch of Array.from(e.changedTouches)) {
      const x = (touch.clientX - rect.left) * this.scaleX;
      const y = (touch.clientY - rect.top) * this.scaleY;
      this.callback(x, y);
    }
  };

  private onClick = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * this.scaleX;
    const y = (e.clientY - rect.top) * this.scaleY;
    this.callback(x, y);
  };

  destroy(): void {
    this.canvas.removeEventListener('touchstart', this.onTouch);
    this.canvas.removeEventListener('click', this.onClick);
  }
}
