type Handler<T = any> = (data: T) => void;

export class EventBus {
  private handlers = new Map<string, Set<Handler>>();

  on<T>(event: string, handler: Handler<T>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  emit<T>(event: string, data?: T): void {
    this.handlers.get(event)?.forEach(fn => fn(data));
  }

  off(event: string, handler?: Handler): void {
    if (handler) {
      this.handlers.get(event)?.delete(handler);
    } else {
      this.handlers.delete(event);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
