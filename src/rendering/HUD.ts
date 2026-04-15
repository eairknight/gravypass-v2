import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class HUD {
  container: Container;

  private levelBar: Graphics;
  private levelText: Text;
  private streakText: Text;
  private multiplierText: Text;
  private countdownText: Text;
  private comboBanner: Text;
  private comboBannerTimer = 0;
  private levelBanner: Container;
  private levelBannerBg: Graphics;
  private levelBannerText: Text;
  private levelBannerTimer = 0;
  private w = 0;

  constructor() {
    this.container = new Container();

    // Level progress bar
    this.levelBar = new Graphics();
    this.levelBar.y = 2;

    // Level label
    this.levelText = new Text({
      text: 'LVL 1',
      style: new TextStyle({
        fontFamily: 'Poppins', fontSize: 12, fontWeight: '700',
        fill: 0xA855F7,
      }),
    });
    this.levelText.anchor.set(0.5, 0);
    this.levelText.y = 6;

    // Streak (top left)
    this.streakText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Poppins', fontSize: 14, fontWeight: '900',
        fill: 0xFBBF24, stroke: { color: 0x000000, width: 2 },
      }),
    });
    this.streakText.x = 10;
    this.streakText.y = 10;

    // Multiplier (top right)
    this.multiplierText = new Text({
      text: '1.00x',
      style: new TextStyle({
        fontFamily: 'Poppins', fontSize: 14, fontWeight: '900',
        fill: 0x84CC16, stroke: { color: 0x000000, width: 2 },
      }),
    });
    this.multiplierText.anchor.set(1, 0);
    this.multiplierText.y = 10;

    // Countdown
    this.countdownText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Fredoka One', fontSize: 72, fontWeight: '400',
        fill: 0xFFFFFF, stroke: { color: 0x7C3AED, width: 6 },
      }),
    });
    this.countdownText.anchor.set(0.5);
    this.countdownText.visible = false;

    // Combo banner
    this.comboBanner = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Poppins', fontSize: 28, fontWeight: '900',
        fill: 0xFBBF24, stroke: { color: 0x000000, width: 4 },
      }),
    });
    this.comboBanner.anchor.set(0.5);
    this.comboBanner.visible = false;

    // Level up banner
    this.levelBanner = new Container();
    this.levelBannerBg = new Graphics();
    this.levelBannerText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Poppins', fontSize: 22, fontWeight: '900',
        fill: 0xFFFFFF, stroke: { color: 0x000000, width: 3 },
      }),
    });
    this.levelBannerText.anchor.set(0.5);
    this.levelBanner.addChild(this.levelBannerBg, this.levelBannerText);
    this.levelBanner.visible = false;

    this.container.addChild(
      this.levelBar, this.levelText, this.streakText, this.multiplierText,
      this.countdownText, this.comboBanner, this.levelBanner,
    );
  }

  resize(w: number, h: number): void {
    this.w = w;
    this.levelText.x = w / 2;
    this.multiplierText.x = w - 10;
    this.countdownText.x = w / 2;
    this.countdownText.y = h * 0.4;
    this.comboBanner.x = w / 2;
    this.comboBanner.y = h * 0.25;
    this.levelBanner.x = 0;
    this.levelBanner.y = h * 0.35;
  }

  updateScore(streak: number, multiplier: number, level: number, progress: number, label: string): void {
    this.streakText.text = streak > 0 ? `${streak} STREAK` : '';
    this.multiplierText.text = `${multiplier.toFixed(2)}x`;

    // Level bar
    this.levelBar.clear();
    this.levelBar.rect(0, 0, this.w, 4);
    this.levelBar.fill({ color: 0x1a0050 });
    this.levelBar.rect(0, 0, this.w * progress, 4);
    this.levelBar.fill({ color: 0xA855F7 });

    this.levelText.text = `LVL ${level + 1} - ${label}`;
  }

  showCountdown(count: number): void {
    this.countdownText.visible = true;
    this.countdownText.text = count > 0 ? String(count) : 'GO!';
    this.countdownText.scale.set(1.5);
  }

  hideCountdown(): void {
    this.countdownText.visible = false;
  }

  showCombo(combo: number): void {
    this.comboBanner.text = `${combo}x COMBO!`;
    this.comboBanner.visible = true;
    this.comboBanner.alpha = 1;
    this.comboBannerTimer = 0.9;
    this.comboBanner.scale.set(1.3);
  }

  showLevelUp(level: number, label: string): void {
    this.levelBannerText.text = `LEVEL ${level + 1} - ${label}`;
    this.levelBannerBg.clear();
    const bw = this.w * 0.75;
    this.levelBannerBg.roundRect(-bw / 2, -25, bw, 50, 25);
    this.levelBannerBg.fill({ color: 0x7C3AED });
    this.levelBannerBg.x = this.w / 2;
    this.levelBannerText.x = this.w / 2;
    this.levelBanner.visible = true;
    this.levelBanner.alpha = 1;
    this.levelBannerTimer = 2.0;
  }

  update(dt: number): void {
    // Combo banner fade
    if (this.comboBannerTimer > 0) {
      this.comboBannerTimer -= dt;
      if (this.comboBannerTimer <= 0.3) {
        this.comboBanner.alpha = this.comboBannerTimer / 0.3;
      }
      this.comboBanner.scale.set(1 + this.comboBannerTimer * 0.2);
      if (this.comboBannerTimer <= 0) this.comboBanner.visible = false;
    }

    // Countdown pulse
    if (this.countdownText.visible && this.countdownText.scale.x > 1) {
      this.countdownText.scale.set(Math.max(1, this.countdownText.scale.x - dt * 3));
    }

    // Level banner fade
    if (this.levelBannerTimer > 0) {
      this.levelBannerTimer -= dt;
      if (this.levelBannerTimer <= 0.5) {
        this.levelBanner.alpha = Math.max(0, this.levelBannerTimer / 0.5);
      }
      if (this.levelBannerTimer <= 0) this.levelBanner.visible = false;
    }
  }
}
