export function rnd(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function rndInt(min: number, max: number): number {
  return Math.floor(rnd(min, max + 1));
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export function formatCurrency(n: number): string {
  return '$' + n.toFixed(2);
}
