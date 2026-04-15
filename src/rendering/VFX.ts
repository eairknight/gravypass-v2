import { Container, Graphics } from 'pixi.js';
import { rnd } from '../utils/math';

export class VFX {
  container: Container;
  private shakeContainer: Container;   // the main container to shake
  private flash: Graphics;
  private shakeMag = 0;
  private shakeDx = 0;
  private shakeDy = 0;

  constructor(shakeTarget: Container) {
    this.container = new Container();
    this.shakeContainer = shakeTarget;

    this.flash = new Graphics();
    this.flash.alpha = 0;
    this.container.addChild(this.flash);
  }

  resize(w: number, h: number): void {
    this.flash.clear();
    this.flash.rect(0, 0, w, h);
    this.flash.fill({ color: 0xFFFFFF });
    this.flash.alpha = 0;
  }

  /** Trigger screen shake */
  shake(magnitude = 8): void {
    this.shakeMag = magnitude;
  }

  /** Trigger screen flash (white or gold) */
  screenFlash(color: number = 0xFFFFFF, intensity = 0.4): void {
    this.flash.clear();
    const w = this.flash.width || 800;
    const h = this.flash.height || 1200;
    this.flash.rect(0, 0, w, h);
    this.flash.fill({ color });
    this.flash.alpha = intensity;
  }

  update(dt: number): void {
    // Screen shake decay
    if (this.shakeMag > 0.5) {
      this.shakeDx = rnd(-this.shakeMag, this.shakeMag);
      this.shakeDy = rnd(-this.shakeMag, this.shakeMag);
      this.shakeContainer.x = this.shakeDx;
      this.shakeContainer.y = this.shakeDy;
      this.shakeMag *= 1 - dt * 12;
    } else if (this.shakeMag > 0) {
      this.shakeMag = 0;
      this.shakeContainer.x = 0;
      this.shakeContainer.y = 0;
    }

    // Flash decay
    if (this.flash.alpha > 0) {
      this.flash.alpha -= dt * 5;
      if (this.flash.alpha < 0) this.flash.alpha = 0;
    }
  }
}
