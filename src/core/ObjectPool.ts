export class ObjectPool<T extends { alive: boolean }> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(factory: () => T, reset: (obj: T) => void, preAllocate: number, maxSize: number) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    for (let i = 0; i < preAllocate; i++) {
      const obj = this.factory();
      obj.alive = false;
      this.pool.push(obj);
    }
  }

  acquire(): T {
    // Find an inactive object
    for (const obj of this.pool) {
      if (!obj.alive) {
        this.reset(obj);
        obj.alive = true;
        return obj;
      }
    }
    // Pool full — recycle oldest if at max, otherwise grow
    if (this.pool.length >= this.maxSize) {
      const oldest = this.pool[0];
      this.reset(oldest);
      oldest.alive = true;
      // Move to end
      this.pool.push(this.pool.shift()!);
      return oldest;
    }
    const obj = this.factory();
    this.reset(obj);
    obj.alive = true;
    this.pool.push(obj);
    return obj;
  }

  release(obj: T): void {
    obj.alive = false;
  }

  forEach(fn: (obj: T) => void): void {
    for (const obj of this.pool) {
      if (obj.alive) fn(obj);
    }
  }

  get activeCount(): number {
    let c = 0;
    for (const obj of this.pool) if (obj.alive) c++;
    return c;
  }

  releaseAll(): void {
    for (const obj of this.pool) obj.alive = false;
  }
}
