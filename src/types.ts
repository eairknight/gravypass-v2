import type { Container, Sprite, Text } from 'pixi.js';

export type GameState = 'idle' | 'countdown' | 'playing' | 'gameover';

export type TileType = 'good' | 'bomb' | 'bonus';

export type PowerUpType = 'freeze' | 'magnet' | 'shield' | 'doubleScore' | 'golden';

export interface TileData {
  id: number;
  col: number;
  x: number;
  y: number;
  speed: number;         // pixels per second (before level multiplier)
  type: TileType;
  powerUp?: PowerUpType;
  color: string;
  emoji: string;
  radius: number;
  alive: boolean;
  tapped: boolean;
  glowT: number;
  wobble: number;
  container?: Container;
  sprite?: Sprite;
  label?: Text;
  trail: { x: number; y: number; alpha: number }[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  radius: number;
  color: number;
  alpha: number;
  decay: number;
  alive: boolean;
  ring?: boolean;
  confetti?: boolean;
  wobblePhase?: number;
  wobbleSpeed?: number;
}

export interface FloatingTextData {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: number;
  alpha: number;
  decay: number;
  scale: number;
  alive: boolean;
  textObj?: Text;
}

export interface ActivePowerUp {
  type: PowerUpType;
  remaining: number;    // seconds remaining
  duration: number;     // total duration
}

export interface GameEvents {
  'tile:tapped': { tile: TileData; gain: number; combo: number };
  'tile:missed': { tile: TileData };
  'bomb:tapped': { tile: TileData };
  'life:lost': { remaining: number };
  'game:start': void;
  'game:countdown': { count: number };
  'game:over': { winnings: number };
  'game:idle': void;
  'level:up': { level: number; label: string };
  'score:milestone': { amount: number };
  'powerup:activated': { type: PowerUpType };
  'powerup:expired': { type: PowerUpType };
  'combo:milestone': { combo: number };
  'streak:milestone': { streak: number };
  'wallet:add': { amount: number };
}
