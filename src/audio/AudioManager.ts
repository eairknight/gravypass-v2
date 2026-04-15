import * as Tone from 'tone';

export class AudioManager {
  muted = false;
  private started = false;

  async init(): Promise<void> {
    if (this.started) return;
    await Tone.start();
    this.started = true;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    Tone.getDestination().volume.value = this.muted ? -Infinity : 0;
    return this.muted;
  }

  get isStarted(): boolean {
    return this.started;
  }
}
