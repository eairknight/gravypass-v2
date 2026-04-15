import type { TileData, TileType, PowerUpType } from '../types';
import {
  COLS, COL_MARGIN, COL_USABLE, TILE_SIZE_RATIO,
  TILE_BASE_SPEED, TILE_STREAK_SPEED, TILE_MAX_SPEED,
  TILE_COLORS, BOMB_COLORS, BONUS_COLOR,
  GOOD_EMOJIS, BOMB_EMOJIS, POWERUP_CHANCE, POWERUP_MIN_STREAK,
} from '../config';
import { pick, rnd } from '../utils/math';

let nextId = 0;

export function colX(col: number, canvasW: number): number {
  const margin = canvasW * COL_MARGIN;
  const step = canvasW * COL_USABLE / (COLS - 1);
  return margin + col * step;
}

export function tileSize(canvasW: number): number {
  return canvasW * TILE_SIZE_RATIO;
}

type PowerUpSelection = PowerUpType;
const POWERUP_TYPES: PowerUpSelection[] = ['freeze', 'magnet', 'shield', 'doubleScore', 'golden'];

export function createTile(
  canvasW: number,
  canvasH: number,
  bombChance: number,
  streak: number,
  occupiedCols: Set<number>,
): TileData | null {
  // Pick a free column
  const free: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (!occupiedCols.has(c)) free.push(c);
  }
  if (free.length === 0) return null;

  const col = pick(free);
  const roll = Math.random();
  let type: TileType;
  let color: string;
  let emoji: string;
  let powerUp: PowerUpType | undefined;

  if (roll < bombChance) {
    type = 'bomb';
    color = pick(BOMB_COLORS);
    emoji = pick(BOMB_EMOJIS);
  } else if (roll < bombChance + 0.10 && streak > 3) {
    type = 'bonus';
    color = BONUS_COLOR;
    emoji = '⭐';
  } else {
    type = 'good';
    color = pick(TILE_COLORS);
    emoji = pick(GOOD_EMOJIS);
  }

  // Power-up chance (only on good/bonus tiles, requires streak)
  if (type !== 'bomb' && streak >= POWERUP_MIN_STREAK && Math.random() < POWERUP_CHANCE) {
    powerUp = pick(POWERUP_TYPES);
    emoji = powerUpEmoji(powerUp);
    color = powerUpColor(powerUp);
  }

  const baseSpeed = canvasH * TILE_BASE_SPEED;
  const speed = Math.min(baseSpeed + streak * canvasH * TILE_STREAK_SPEED, canvasH * TILE_MAX_SPEED);
  const radius = tileSize(canvasW);

  return {
    id: nextId++,
    col,
    x: colX(col, canvasW),
    y: -radius,
    speed,
    type,
    powerUp,
    color,
    emoji,
    radius,
    alive: true,
    tapped: false,
    glowT: 0,
    wobble: 0,
    trail: [],
  };
}

function powerUpEmoji(type: PowerUpType): string {
  switch (type) {
    case 'freeze': return '❄️';
    case 'magnet': return '🧲';
    case 'shield': return '🛡️';
    case 'doubleScore': return '2️⃣';
    case 'golden': return '💰';
  }
}

function powerUpColor(type: PowerUpType): string {
  switch (type) {
    case 'freeze': return '#38BDF8';
    case 'magnet': return '#A855F7';
    case 'shield': return '#22C55E';
    case 'doubleScore': return '#FBBF24';
    case 'golden': return '#FFD700';
  }
}
