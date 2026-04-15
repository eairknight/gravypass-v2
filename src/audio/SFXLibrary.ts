import * as Tone from 'tone';
import type { AudioManager } from './AudioManager';
import { rnd } from '../utils/math';

export class SFXLibrary {
  private audio: AudioManager;
  private splatSynth!: Tone.Synth;
  private chachingSynth!: Tone.PolySynth;
  private bonusSynth!: Tone.FMSynth;
  private missSynth!: Tone.Synth;
  private bombSynth!: Tone.MembraneSynth;
  private levelUpSynth!: Tone.PolySynth;
  private powerUpSynth!: Tone.FMSynth;
  private cashSynth!: Tone.MetalSynth;
  private gameOverSynth!: Tone.Synth;
  private initialized = false;

  constructor(audio: AudioManager) {
    this.audio = audio;
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.splatSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 },
      volume: -12,
    }).toDestination();

    this.chachingSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
      volume: -10,
    }).toDestination();

    this.bonusSynth = new Tone.FMSynth({
      harmonicity: 3,
      modulationIndex: 10,
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 },
      volume: -10,
    }).toDestination();

    this.missSynth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 },
      volume: -15,
    }).toDestination();

    this.bombSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
      volume: -8,
    }).toDestination();

    this.levelUpSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.05, release: 0.2 },
      volume: -10,
    }).toDestination();

    this.powerUpSynth = new Tone.FMSynth({
      harmonicity: 5,
      modulationIndex: 15,
      envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
      volume: -10,
    }).toDestination();

    this.cashSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.4, release: 0.1 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
      volume: -12,
    }).toDestination();

    this.gameOverSynth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.5 },
      volume: -10,
    }).toDestination();
  }

  private pitchVariation(): number {
    return rnd(-3, 3); // semitones
  }

  playSplat(): void {
    if (this.audio.muted || !this.initialized) return;
    const base = Tone.Frequency('C5').toFrequency();
    const shift = Tone.Frequency(base).transpose(this.pitchVariation()).toFrequency();
    this.splatSynth.triggerAttackRelease(shift, '32n');
  }

  playChaChing(): void {
    if (this.audio.muted || !this.initialized) return;
    const now = Tone.now();
    const notes = ['C5', 'E5', 'G5', 'C6'];
    notes.forEach((n, i) => {
      this.chachingSynth.triggerAttackRelease(n, '32n', now + i * 0.06);
    });
  }

  playBonus(): void {
    if (this.audio.muted || !this.initialized) return;
    const notes = ['E5', 'G5', 'B5', 'E6'];
    const now = Tone.now();
    notes.forEach((n, i) => {
      this.bonusSynth.triggerAttackRelease(n, '32n', now + i * 0.05);
    });
  }

  playMiss(): void {
    if (this.audio.muted || !this.initialized) return;
    this.missSynth.triggerAttackRelease('A2', '8n');
  }

  playBomb(): void {
    if (this.audio.muted || !this.initialized) return;
    this.bombSynth.triggerAttackRelease('C1', '8n');
  }

  playLevelUp(): void {
    if (this.audio.muted || !this.initialized) return;
    const now = Tone.now();
    const fanfare = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6'];
    fanfare.forEach((n, i) => {
      this.levelUpSynth.triggerAttackRelease(n, '16n', now + i * 0.08);
    });
  }

  playPowerUp(): void {
    if (this.audio.muted || !this.initialized) return;
    const now = Tone.now();
    const notes = ['C5', 'E5', 'G5', 'B5', 'D6'];
    notes.forEach((n, i) => {
      this.powerUpSynth.triggerAttackRelease(n, '32n', now + i * 0.04);
    });
  }

  playCashRegister(): void {
    if (this.audio.muted || !this.initialized) return;
    this.cashSynth.triggerAttackRelease('16n', Tone.now());
    const now = Tone.now();
    // Bell ching
    this.chachingSynth.triggerAttackRelease('E6', '32n', now + 0.15);
    this.chachingSynth.triggerAttackRelease('G6', '32n', now + 0.25);
    this.chachingSynth.triggerAttackRelease('B6', '32n', now + 0.35);
  }

  playGameOver(): void {
    if (this.audio.muted || !this.initialized) return;
    const now = Tone.now();
    const notes = ['E4', 'D4', 'C4', 'B3', 'A3', 'G3'];
    notes.forEach((n, i) => {
      this.gameOverSynth.triggerAttackRelease(n, '8n', now + i * 0.12);
    });
  }

  playCombo(): void {
    if (this.audio.muted || !this.initialized) return;
    const now = Tone.now();
    this.chachingSynth.triggerAttackRelease('G5', '32n', now);
    this.chachingSynth.triggerAttackRelease('B5', '32n', now + 0.04);
    this.chachingSynth.triggerAttackRelease('D6', '32n', now + 0.08);
  }

  playNearMiss(): void {
    if (this.audio.muted || !this.initialized) return;
    this.splatSynth.triggerAttackRelease('A4', '32n');
  }

  playMilestone(): void {
    if (this.audio.muted || !this.initialized) return;
    const now = Tone.now();
    const fanfare = ['C5', 'E5', 'G5', 'C6', 'G5', 'C6', 'E6', 'G6'];
    fanfare.forEach((n, i) => {
      this.levelUpSynth.triggerAttackRelease(n, '8n', now + i * 0.1);
    });
  }
}
