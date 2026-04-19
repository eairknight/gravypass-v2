import { Application, Container, Graphics } from 'pixi.js';
import type { GameState, TileData } from '../types';
import { EventBus } from './EventBus';
import { GameLoop } from './GameLoop';
import { DifficultySystem } from '../systems/DifficultySystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { LivesSystem } from '../systems/LivesSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { TileManager } from '../entities/TileManager';
import { PowerUpManager } from '../entities/PowerUp';
import { Background } from '../rendering/Background';
import { TileRenderer } from '../rendering/TileRenderer';
import { ParticleSystem } from '../rendering/ParticleSystem';
import { VFX } from '../rendering/VFX';
import { FloatingText } from '../rendering/FloatingText';
import { HUD } from '../rendering/HUD';
import { AudioManager } from '../audio/AudioManager';
import { SFXLibrary } from '../audio/SFXLibrary';
import { MusicEngine } from '../audio/MusicEngine';
import { HapticManager } from '../audio/HapticManager';
import { TouchHandler } from '../input/TouchHandler';
import { StartOverlay } from '../ui/StartOverlay';
import { GameOverOverlay } from '../ui/GameOverOverlay';
import { WalletUI } from '../ui/WalletUI';
import { LivesDisplay } from '../ui/LivesDisplay';
import { Ticker } from '../ui/Ticker';
import { CasinoSystem } from '../systems/CasinoSystem';
import { CasinoUI } from '../ui/CasinoUI';
import { LivePopups } from '../ui/LivePopups';
import { FRENZY_THRESHOLD, FRENZY_BONUS } from '../config';
import { formatCurrency, hexToNum } from '../utils/math';

export class Game {
  private app!: Application;
  private state: GameState = 'idle';
  private bus: EventBus;
  private loop: GameLoop;

  // Systems
  private difficulty: DifficultySystem;
  private score: ScoreSystem;
  private lives: LivesSystem;
  private collision: CollisionSystem;
  private tileManager: TileManager;
  private powerUps: PowerUpManager;
  private casino: CasinoSystem;

  // Rendering
  private gameContainer!: Container;
  private trailGfx!: Graphics;
  private background!: Background;
  private tileRenderer!: TileRenderer;
  private particles!: ParticleSystem;
  private vfx!: VFX;
  private floatingText!: FloatingText;
  private hud!: HUD;

  // Audio
  private audio: AudioManager;
  private sfx: SFXLibrary;
  private music: MusicEngine;
  private haptics: HapticManager;

  // UI
  private startOverlay!: StartOverlay;
  private gameOverOverlay!: GameOverOverlay;
  private walletUI!: WalletUI;
  private livesDisplay!: LivesDisplay;
  private ticker!: Ticker;
  private casinoUI!: CasinoUI;
  private livePopups!: LivePopups;

  // Input
  private touchHandler!: TouchHandler;

  // Countdown
  private countdownTimer = 0;
  private countdownCount = 3;

  // Voice line
  private voicePlayed = false;

  // Frenzy mode
  private inFrenzy = false;

  constructor() {
    this.bus = new EventBus();
    this.difficulty = new DifficultySystem(this.bus);
    this.score = new ScoreSystem(this.bus);
    this.lives = new LivesSystem(this.bus);
    this.collision = new CollisionSystem();
    this.tileManager = new TileManager(this.difficulty, this.bus);
    this.powerUps = new PowerUpManager(this.bus);
    this.casino = new CasinoSystem(this.bus);
    this.audio = new AudioManager();
    this.sfx = new SFXLibrary(this.audio);
    this.music = new MusicEngine(this.audio);
    this.haptics = new HapticManager();
    this.loop = new GameLoop(this.update.bind(this));
  }

  async init(): Promise<void> {
    const gameArea = document.getElementById('gameArea')!;

    this.app = new Application();
    await this.app.init({
      resizeTo: gameArea,
      backgroundColor: hexToNum('#0a1820'),
      antialias: true,
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
    });

    gameArea.appendChild(this.app.canvas);
    this.app.canvas.style.touchAction = 'none';

    // Build scene graph
    this.gameContainer = new Container();
    this.background = new Background();
    this.tileRenderer = new TileRenderer();
    this.trailGfx = new Graphics();
    this.particles = new ParticleSystem();
    this.floatingText = new FloatingText();
    this.hud = new HUD();
    this.vfx = new VFX(this.gameContainer);

    this.gameContainer.addChild(
      this.background.container,
      this.trailGfx,
      this.tileRenderer.container,
      this.particles.container,
      this.floatingText.container,
      this.hud.container,
    );

    this.app.stage.addChild(this.gameContainer, this.vfx.container);

    // Input
    this.touchHandler = new TouchHandler(
      this.app.canvas as HTMLCanvasElement,
      this.handleTap.bind(this),
    );

    // UI
    this.startOverlay = new StartOverlay(() => this.startCountdown());
    this.gameOverOverlay = new GameOverOverlay(
      () => this.addToWallet(),
      () => this.startCountdown(),
    );
    this.walletUI = new WalletUI();
    this.livesDisplay = new LivesDisplay();
    this.ticker = new Ticker();
    this.casinoUI = new CasinoUI();
    this.livePopups = new LivePopups(this.bus);

    // Events
    this.setupEvents();

    // Resize
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // Mute button
    document.getElementById('muteBtn')?.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      const el = document.getElementById('muteBtn')!;
      el.textContent = muted ? '\u{1F507}' : '\u{1F50A}';
      if (muted) this.music.stopAll();
      else if (this.state === 'idle') this.music.startIntro();
    });

    // Start
    this.showIdle();
    this.loop.start();
    this.ticker.startRotation();
  }

  private setupEvents(): void {
    this.bus.on('tile:missed', ({ tile }: { tile: TileData }) => {
      if (this.state !== 'playing') return;
      if (this.powerUps.consumeShield()) {
        this.sfx.playBonus();
        this.haptics.powerUp();
        this.showToast('Shield absorbed!');
        return;
      }
      this.score.breakStreak();
      this.checkFrenzy();
      const gameOver = this.lives.loseLife();
      this.sfx.playMiss();
      this.haptics.lifeLost();
      this.vfx.shake(12);
      this.vfx.screenFlash(0xFF1744, 0.3);
      this.particles.lifeLostBurst(tile.x, this.app.screen.height * 0.88);
      this.livesDisplay.update(this.lives.lives);
      this.showError(`Missed! ${this.lives.lives} lives left`);
      if (gameOver) this.endGame();
    });

    this.bus.on('life:lost', () => {
      this.livesDisplay.update(this.lives.lives);
    });

    this.bus.on('level:up', ({ level, label }: { level: number; label: string }) => {
      this.sfx.playLevelUp();
      this.haptics.levelUp();
      this.hud.showLevelUp(level, label);
      this.particles.confettiBurst(this.app.screen.width / 2, this.app.screen.height * 0.35, 30);
      this.music.updateBPM(level);
      // Update level strip
      this.updateLevelStrip(label);
    });

    this.bus.on('score:milestone', ({ amount }: { amount: number }) => {
      this.sfx.playMilestone();
      this.haptics.milestone();
      this.vfx.screenFlash(0xFFD700, 0.5);
      this.particles.confettiBurst(this.app.screen.width / 2, this.app.screen.height / 2, 80);
    });

    this.bus.on('powerup:activated', ({ type }: { type: string }) => {
      this.sfx.playPowerUp();
      this.haptics.powerUp();
      this.vfx.screenFlash(0x3FC1E4, 0.2);
      const labels: Record<string, string> = {
        freeze: 'FREEZE!', magnet: 'MAGNET!', shield: 'SHIELD!',
        doubleScore: '2X SCORE!', golden: 'GOLDEN PLATE! +$0.10',
      };
      this.showToast(labels[type] || type);
    });

    this.bus.on('streak:milestone', ({ streak }: { streak: number }) => {
      this.sfx.playChaChing();
      this.hud.showCombo(streak);
    });

    this.bus.on('combo:milestone', ({ combo }: { combo: number }) => {
      this.sfx.playCombo();
      this.haptics.combo();
      this.hud.showCombo(combo);
    });

    // Casino events
    this.bus.on('casino:jackpot', ({ amount, message }: { amount: number; message: string }) => {
      this.score.winnings = parseFloat((this.score.winnings + amount).toFixed(2));
      this.walletUI.updateWinnings(this.score.winnings);
      this.casinoUI.showJackpot(amount, message);
      this.sfx.playMilestone();
      this.haptics.milestone();
      this.vfx.screenFlash(0xFFD700, 0.6);
      this.particles.confettiBurst(this.app.screen.width / 2, this.app.screen.height / 2, 80);
      this.livePopups.checkMilestone(this.score.winnings);
    });

    this.bus.on('casino:nearmiss', () => {
      this.casinoUI.showNearMiss();
    });

    this.bus.on('casino:tierchange', ({ tier }: { tier: string }) => {
      this.casinoUI.updateTier(tier as any);
      this.sfx.playLevelUp();
      this.haptics.levelUp();
    });

    this.bus.on('casino:luckyspin', () => {
      this.casinoUI.showLuckySpin();
      this.sfx.playBonus();
      this.haptics.powerUp();
      this.score.winnings = parseFloat((this.score.winnings + 0.05).toFixed(2));
      this.walletUI.updateWinnings(this.score.winnings);
      this.floatingText.spawn(this.app.screen.width / 2, this.app.screen.height * 0.3, '+$0.05 LUCKY!', 0xFFD700, 24);
      this.livePopups.checkMilestone(this.score.winnings);
    });

    this.bus.on('milestone:reached', ({ amount }: { amount: number }) => {
      this.sfx.playMilestone();
      this.haptics.milestone();
      this.vfx.screenFlash(0xFFD700, 0.5);
      this.particles.confettiBurst(this.app.screen.width / 2, this.app.screen.height / 2, 100);
    });
  }

  private handleResize(): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    this.background.resize(w, h);
    this.tileRenderer.resize(w, h);
    this.tileManager.resize(w, h);
    this.vfx.resize(w, h);
    this.hud.resize(w, h);

    const canvas = this.app.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    this.touchHandler.updateScale(rect.width, rect.height, w, h);
  }

  private showIdle(): void {
    this.state = 'idle';
    this.startOverlay.show();
    this.audio.init().then(() => {
      this.sfx.init();
      this.music.init();
      this.music.startIntro();
    });
  }

  private startCountdown(): void {
    this.state = 'countdown';
    this.countdownCount = 3;
    this.countdownTimer = 0;
    this.gameOverOverlay.hide();

    this.audio.init().then(() => {
      this.sfx.init();
      this.music.init();
      this.music.stopAll();
    });

    // Reset everything
    this.difficulty.reset();
    this.score.reset();
    this.lives.reset();
    this.tileManager.reset();
    this.powerUps.reset();
    this.casino.reset();
    this.particles.clear();
    this.floatingText.clear();
    this.tileRenderer.clear();
    this.livesDisplay.reset();
    this.casinoUI.hide();
    this.livePopups.resetMilestones();
    this.walletUI.reset();
    this.inFrenzy = false;

    // Reset level strip
    this.updateLevelStrip('Easy Money');

    this.hud.showCountdown(3);

    if (!this.voicePlayed) {
      this.voicePlayed = true;
      this.playVoiceLine();
    }
  }

  private startPlaying(): void {
    this.state = 'playing';
    this.hud.hideCountdown();
    this.music.startGameMusic(0);
    this.bus.emit('game:start');
    // Start showing live cashout popups
    this.livePopups.startPopups();
  }

  private endGame(): void {
    this.state = 'gameover';
    this.lives.cleanup();
    this.music.stopAll();
    this.sfx.playGameOver();
    this.haptics.gameOver();
    this.vfx.shake(15);
    this.livePopups.stopPopups();
    this.livePopups.showFrenzy(false);
    this.bus.emit('game:over', { winnings: this.score.winnings });
    this.gameOverOverlay.show(this.score.winnings);
  }

  private addToWallet(): void {
    if (this.score.winnings <= 0) return;
    this.sfx.playCashRegister();
    const amount = this.score.addToWallet();
    this.showToast(`${formatCurrency(amount)} CASHED OUT!`);
    this.gameOverOverlay.hide();
    this.walletUI.redirectToOffer();

    setTimeout(() => {
      this.walletUI.hideFloatCTA();
      this.showIdle();
    }, 300);
  }

  private handleTap(x: number, y: number): void {
    if (this.state === 'countdown') return;
    if (this.state !== 'playing') return;

    const hit = this.collision.hitTest(x, y, this.tileManager.tiles, this.app.screen.width);

    if (!hit) {
      this.particles.ring(x, y);
      return;
    }

    if (hit.type === 'bomb') {
      hit.alive = false;
      hit.tapped = true;
      this.tileRenderer.removeTile(hit);
      this.sfx.playBomb();
      this.haptics.bomb();
      this.vfx.shake(15);
      this.vfx.screenFlash(0xFF1744, 0.4);
      this.particles.splash(hit.x, hit.y, false);

      if (this.powerUps.consumeShield()) {
        this.showToast('Shield absorbed!');
        return;
      }

      this.score.breakStreak();
      this.checkFrenzy();
      const gameOver = this.lives.loseLife();
      this.livesDisplay.update(this.lives.lives);
      this.showError(`Bomb! ${this.lives.lives} lives left`);
      if (gameOver) this.endGame();
      return;
    }

    // Good or bonus tile
    hit.tapped = true;
    hit.alive = false;

    // Power-up
    if (hit.powerUp) {
      this.powerUps.activate(hit);
      if (hit.powerUp === 'golden') {
        this.score.winnings = parseFloat((this.score.winnings + 0.10).toFixed(2));
        this.particles.coinShower(hit.x, hit.y);
        this.floatingText.spawn(hit.x, hit.y - 20, '+$0.10', 0xFFD700, 26);
      }
      this.particles.powerUpSparkle(hit.x, hit.y, hexToNum(hit.color));
    }

    const hasDouble = this.powerUps.has('doubleScore');
    const hasFrenzy = this.inFrenzy;
    const gain = this.score.scoreTap(hit, hasDouble, hasFrenzy ? FRENZY_BONUS : 1);

    this.sfx.playSplat();
    this.haptics.tap();
    this.particles.splash(hit.x, hit.y, true);
    this.floatingText.spawn(hit.x, hit.y - 30, `+${formatCurrency(gain)}`, 0xFFD700);
    this.tileRenderer.removeTile(hit);

    if (hit.type === 'bonus') {
      this.sfx.playBonus();
      this.vfx.screenFlash(0xFFD700, 0.2);
    }

    // Casino
    this.casino.checkJackpot(this.score.streak);
    this.casino.updateStreakTier(this.score.streak);
    this.checkFrenzy();

    // Update all UI
    this.walletUI.updateWinnings(this.score.winnings);
    this.walletUI.updateMultiplier(this.score.multiplier);
    this.walletUI.updateStreak(this.score.streak);
    this.livePopups.checkMilestone(this.score.winnings);
  }

  private checkFrenzy(): void {
    const shouldFrenzy = this.score.streak >= FRENZY_THRESHOLD;
    if (shouldFrenzy !== this.inFrenzy) {
      this.inFrenzy = shouldFrenzy;
      this.livePopups.showFrenzy(shouldFrenzy);
      if (shouldFrenzy) {
        this.sfx.playLevelUp();
        this.haptics.milestone();
        this.vfx.screenFlash(0xFFD700, 0.3);
      }
    }
  }

  private update(dt: number): void {
    if (this.state === 'countdown') {
      this.countdownTimer += dt;
      if (this.countdownTimer >= 1) {
        this.countdownTimer = 0;
        this.countdownCount--;
        if (this.countdownCount > 0) {
          this.hud.showCountdown(this.countdownCount);
        } else {
          this.hud.showCountdown(0);
          setTimeout(() => this.startPlaying(), 400);
        }
      }
    }

    if (this.state === 'playing') {
      this.difficulty.update(dt);
      this.powerUps.update(dt);
      this.tileManager.update(dt, this.score.streak, this.powerUps.active);

      for (const tile of this.tileManager.tiles) {
        if (!tile.container && tile.alive) {
          this.tileRenderer.createTileDisplay(tile);
        }
      }

      for (const tile of this.tileManager.tiles) {
        if (tile.alive) {
          this.tileRenderer.updateTile(tile, dt);
        }
      }

      const cfg = this.difficulty.getConfig();
      this.hud.updateScore(
        this.score.streak,
        this.score.multiplier,
        this.difficulty.level,
        this.difficulty.progress,
        cfg.label,
      );

      // Update level strip
      const el = document.getElementById('levelFill');
      if (el) el.style.width = `${this.difficulty.progress * 100}%`;
    }

    this.background.update(dt, this.difficulty.level);
    this.tileRenderer.drawTrails(this.trailGfx, this.tileManager.tiles);
    this.particles.update(dt);
    this.floatingText.update(dt);
    this.vfx.update(dt);
    this.hud.update(dt);
  }

  private updateLevelStrip(label: string): void {
    const el = document.getElementById('levelName');
    if (el) el.textContent = label;
  }

  private showToast(msg: string): void {
    const el = document.getElementById('toast')!;
    el.textContent = msg;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  private showError(msg: string): void {
    const el = document.getElementById('errorFlash')!;
    el.textContent = msg;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  private playVoiceLine(): void {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance('SHOW ME THE MONEY!');
    u.rate = 1.25;
    u.pitch = 1.4;
    u.volume = 0.8;
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v => /Alex|Daniel|Fred|Ralph|Bruce/i.test(v.name));
    if (preferred) u.voice = preferred;
    else {
      const english = voices.find(v => v.lang.startsWith('en'));
      if (english) u.voice = english;
    }
    speechSynthesis.speak(u);
  }
}
