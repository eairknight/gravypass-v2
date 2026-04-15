import * as Tone from 'tone';
import type { AudioManager } from './AudioManager';

export class MusicEngine {
  private audio: AudioManager;
  private introLoop: Tone.Loop | null = null;
  private gameLoop: Tone.Loop | null = null;
  private playing: 'intro' | 'game' | 'none' = 'none';
  private initialized = false;

  private melodySynth!: Tone.Synth;
  private bassSynth!: Tone.Synth;
  private padSynth!: Tone.PolySynth;
  private kickSynth!: Tone.MembraneSynth;
  private snareSynth!: Tone.NoiseSynth;
  private hatSynth!: Tone.NoiseSynth;
  private arpSynth!: Tone.Synth;
  private bellSynth!: Tone.Synth;

  constructor(audio: AudioManager) { this.audio = audio; }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.melodySynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0.15, release: 0.08 },
      volume: -18,
    }).toDestination();

    this.bassSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.25, sustain: 0.4, release: 0.15 },
      volume: -12,
    }).toDestination();

    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.08, decay: 0.4, sustain: 0.25, release: 0.4 },
      volume: -24,
    }).toDestination();

    this.kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.04, octaves: 5,
      envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.04 },
      volume: -8,
    }).toDestination();

    this.snareSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.04 },
      volume: -18,
    }).toDestination();

    this.hatSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.035, sustain: 0, release: 0.01 },
      volume: -24,
    }).toDestination();

    this.arpSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.003, decay: 0.08, sustain: 0, release: 0.06 },
      volume: -20,
    }).toDestination();

    this.bellSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.3 },
      volume: -26,
    }).toDestination();
  }

  startIntro(): void {
    if (this.audio.muted || !this.initialized) return;
    this.stopAll();
    Tone.getTransport().bpm.value = 138;

    const melody = ['E5','G5','B5','E6','D6','B5','C6','B5','A5','C6','E6','A6','G6','E6','F6','E6'];
    const bassLine = ['E2','E2','A2','A2','B2','B2','E3','B2'];
    const chords = [['E4','G#4','B4'],['A4','C#5','E5'],['B4','D#5','F#5'],['E4','G#4','B4']];
    const arp = ['E5','G#5','B5','E6','B5','G#5'];
    const bells = ['E6','B6','G#6','E7'];
    let mi=0,bi=0,ci=0,ai=0,bli=0,beat=0;

    this.introLoop = new Tone.Loop((time) => {
      if (beat%2===0) { this.melodySynth.triggerAttackRelease(melody[mi%melody.length],'16n',time); mi++; }
      if (beat%4===0) { this.bassSynth.triggerAttackRelease(bassLine[bi%bassLine.length],'4n',time); bi++; }
      if (beat%8===0) { this.padSynth.triggerAttackRelease(chords[ci%chords.length],'2n',time); ci++; }
      if (beat%4===0) this.kickSynth.triggerAttackRelease('C1','8n',time);
      if (beat%8===4) this.snareSynth.triggerAttackRelease('16n',time);
      this.hatSynth.triggerAttackRelease('32n',time);
      if (beat%3===0) { this.arpSynth.triggerAttackRelease(arp[ai%arp.length],'32n',time); ai++; }
      if (beat%16===0) { this.bellSynth.triggerAttackRelease(bells[bli%bells.length],'8n',time); bli++; }
      beat++;
    }, '16n');

    this.introLoop.start(0);
    Tone.getTransport().start();
    this.playing = 'intro';
  }

  startGameMusic(level = 0): void {
    if (this.audio.muted || !this.initialized) return;
    this.stopAll();
    const bpm = Math.min(115 + level * 9, 165);
    Tone.getTransport().bpm.value = bpm;

    const bassNotes = ['E2','G2','B2','E3','B2','G2','A2','B2'];
    const bellNotes = ['E6','B6','G#6'];
    let bi=0,bli=0,beat=0;

    this.gameLoop = new Tone.Loop((time) => {
      if (beat%4===0) this.kickSynth.triggerAttackRelease('C1','8n',time);
      if (beat%2===1) this.hatSynth.triggerAttackRelease('32n',time);
      if (beat%8===4) this.snareSynth.triggerAttackRelease('16n',time);
      if (beat%4===0) { this.bassSynth.triggerAttackRelease(bassNotes[bi%bassNotes.length],'8n',time); bi++; }
      if (beat%6===0) this.arpSynth.triggerAttackRelease(['E5','G#5','B5'][beat%3],'32n',time);
      if (beat%24===0) { this.bellSynth.triggerAttackRelease(bellNotes[bli%bellNotes.length],'8n',time); bli++; }
      beat++;
    }, '16n');

    this.gameLoop.start(0);
    Tone.getTransport().start();
    this.playing = 'game';
  }

  updateBPM(level: number): void {
    if (this.playing !== 'game') return;
    Tone.getTransport().bpm.rampTo(Math.min(115 + level * 9, 165), 1);
  }

  stopAll(): void {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    if (this.introLoop) { this.introLoop.stop(); this.introLoop.dispose(); this.introLoop = null; }
    if (this.gameLoop) { this.gameLoop.stop(); this.gameLoop.dispose(); this.gameLoop = null; }
    this.playing = 'none';
  }

  get isPlaying(): string { return this.playing; }
}
