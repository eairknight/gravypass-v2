import gsap from 'gsap';

export class StartOverlay {
  el: HTMLElement;
  private onPlay: () => void;

  constructor(onPlay: () => void) {
    this.onPlay = onPlay;
    this.el = document.getElementById('startOv')!;
    const btn = document.getElementById('playBtn')!;
    btn.addEventListener('click', () => this.handlePlay());
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.handlePlay(); }, { passive: false });
  }

  private handlePlay(): void {
    this.hide();
    this.onPlay();
  }

  show(): void {
    this.el.style.display = 'flex';
    gsap.fromTo(this.el, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' });
  }

  hide(): void {
    gsap.to(this.el, {
      opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in',
      onComplete: () => { this.el.style.display = 'none'; },
    });
  }
}
