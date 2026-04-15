import { Container, Text, TextStyle } from 'pixi.js';

interface FloatEntry {
  text: Text;
  vy: number;
  decay: number;
  alive: boolean;
}

export class FloatingText {
  container: Container;
  private entries: FloatEntry[] = [];

  constructor() {
    this.container = new Container();
  }

  spawn(x: number, y: number, str: string, color: number = 0xFBBF24, size = 20): void {
    const text = new Text({
      text: str,
      style: new TextStyle({
        fontFamily: 'Poppins',
        fontSize: size,
        fontWeight: '900',
        fill: color,
        stroke: { color: 0x000000, width: 3 },
      }),
    });
    text.anchor.set(0.5);
    text.x = x;
    text.y = y;

    this.container.addChild(text);
    this.entries.push({
      text,
      vy: -120,
      decay: 1.5,
      alive: true,
    });
  }

  update(dt: number): void {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const e = this.entries[i];
      e.text.y += e.vy * dt;
      e.text.alpha -= e.decay * dt;
      e.text.scale.set(e.text.scale.x + dt * 0.3);

      if (e.text.alpha <= 0) {
        this.container.removeChild(e.text);
        e.text.destroy();
        this.entries.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const e of this.entries) {
      this.container.removeChild(e.text);
      e.text.destroy();
    }
    this.entries = [];
  }
}
