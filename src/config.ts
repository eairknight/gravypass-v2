// ═══ V2: MONEY-FIRST CASINO GAME CONFIG ═══════════════════

export const OFFER_URL = 'https://gravypass.com/offer';

// Grid
export const COLS = 3;
export const COL_MARGIN = 0.07;
export const COL_USABLE = 0.86;

// Tile sizing — smaller = more action on screen
export const TILE_SIZE_RATIO = 0.105;
export const HIT_PADDING = 1.45;

// Lives — 4 lives = longer sessions = more money accumulated
export const MAX_LIVES = 4;
export const INVINCIBILITY_MS = 2000;

// Scoring — MUCH more generous, big numbers feel addictive
export const BASE_WIN = 0.15;
export const WIN_PER_STREAK = 0.025;
export const MAX_WIN_PER_TAP = 0.50;
export const MULTIPLIER_PER_STREAK = 0.20;
export const BONUS_MULTIPLIER = 3;

// Combo — easier to trigger, bigger rewards
export const COMBO_WINDOW_MS = 500;
export const COMBO_TIERS = [
  { min: 2, max: 4, bonus: 1.3 },
  { min: 5, max: 9, bonus: 1.8 },
  { min: 10, max: 19, bonus: 2.5 },
  { min: 20, max: Infinity, bonus: 3.5 },
];

// Physics
export const TILE_BASE_SPEED = 0.24;
export const TILE_STREAK_SPEED = 0.005;
export const TILE_MAX_SPEED = 0.55;
export const PARTICLE_GRAVITY = 10.8;
export const PARTICLE_DECAY = 2.28;

// Danger zone
export const DANGER_Y = 0.88;
export const WARNING_Y = 0.60;

// Levels — money-themed names
export const LEVEL_DURATION_S = 7;

export interface LevelConfig {
  label: string;
  speedMul: number;
  interval: number;
  bombChance: number;
  doubleSpawn: boolean;
}

export const LEVELS: LevelConfig[] = [
  { label: 'Easy Money',     speedMul: 1.00, interval: 55, bombChance: 0.08, doubleSpawn: false },
  { label: 'Cash Flow',      speedMul: 1.15, interval: 45, bombChance: 0.11, doubleSpawn: false },
  { label: 'Money Maker',    speedMul: 1.35, interval: 38, bombChance: 0.15, doubleSpawn: false },
  { label: 'Big Earner',     speedMul: 1.60, interval: 30, bombChance: 0.19, doubleSpawn: true },
  { label: 'JACKPOT MODE',   speedMul: 1.90, interval: 24, bombChance: 0.23, doubleSpawn: true },
  { label: 'MEGA PAYOUT',    speedMul: 2.30, interval: 20, bombChance: 0.27, doubleSpawn: true },
];

export const ENDLESS_LABELS = ['DIAMOND HANDS', 'WHALE MODE', 'LEGENDARY', 'GOD TIER'];

export function getEndlessConfig(level: number): LevelConfig {
  const extra = level - 5;
  return {
    label: ENDLESS_LABELS[Math.min(extra - 1, ENDLESS_LABELS.length - 1)] || 'GOD TIER',
    speedMul: Math.min(2.30 + extra * 0.20, 4.5),
    interval: Math.max(20 - extra * 2, 14),
    bombChance: Math.min(0.27 + extra * 0.015, 0.38),
    doubleSpawn: true,
  };
}

// Power-ups — spawn MORE often, lower streak requirement
export const POWERUP_CHANCE = 0.06;
export const POWERUP_MIN_STREAK = 3;

export const POWERUP_DURATIONS: Record<string, number> = {
  freeze: 4,
  magnet: 6,
  shield: Infinity,
  doubleScore: 10,
  golden: 0,
};

// Milestones — many small ones for frequent celebrations
export const MILESTONES = [0.50, 1, 2, 5, 10, 15, 20, 30, 50];

// Cashout progress bar target
export const CASHOUT_GOAL = 10.00;

// ═══ CASINO PSYCHOLOGY ═══════════════════════
export const JACKPOT_CHANCE_PER_TAP = 0.03;
export const JACKPOT_MIN_STREAK = 5;
export const JACKPOT_AMOUNTS = [0.25, 0.50, 0.75, 1.00, 2.00, 5.00, 10.00];
export const JACKPOT_WEIGHTS = [25, 25, 20, 15, 8, 5, 2];

export const HOT_STREAK_THRESHOLD = 4;
export const FIRE_STREAK_THRESHOLD = 8;
export const MEGA_STREAK_THRESHOLD = 15;

export const LUCKY_SPIN_STREAK = 10;
export const NEAR_WIN_CHANCE = 0.20;

export const FRENZY_THRESHOLD = 12;
export const FRENZY_BONUS = 2.0;

// Fake "live cashout" popups
export const CASHOUT_POPUP_INTERVAL_S = 8;
export const CASHOUT_POPUP_AMOUNTS = [
  '$3.40', '$5.20', '$7.80', '$11.60', '$14.50',
  '$9.30', '$22.10', '$6.70', '$18.90', '$8.40',
];
export const CASHOUT_POPUP_NAMES = [
  'Mike T.', 'Sarah K.', 'James R.', 'Ashley M.', 'Chris P.', 'Jess L.',
  'David W.', 'Emma S.', 'Ryan B.', 'Olivia H.', 'Nick F.', 'Mia C.',
  'Tyler G.', 'Sophia N.', 'Brandon A.', 'Ava D.', 'Josh M.', 'Lily R.',
];

export const JACKPOT_MESSAGES = [
  'JACKPOT!', 'BIG WIN!', 'MEGA BONUS!', 'CA-CHING!',
  'PAYDAY!', 'CASH BONUS!', 'LUCKY WIN!',
];

// ═══ PREMIUM GOLD/BLACK THEME ═══════════════
export const COLORS = {
  bg1: '#0a0a0f',
  bg2: '#111118',
  bg3: '#1a1a25',
  gold: '#FFD700',
  goldDark: '#B8860B',
  goldLight: '#FFED4A',
  green: '#00E676',
  greenDark: '#00C853',
  red: '#FF1744',
  redDark: '#D50000',
  purple: '#7C4DFF',
  cyan: '#00E5FF',
  white: '#FFFFFF',
  dim: '#6B7280',
  cash: '#4ADE80',
};

export const TILE_COLORS = ['#FFD700', '#00E676', '#00E5FF', '#FF6D00', '#7C4DFF', '#FF4081'];
export const BOMB_COLORS = ['#FF1744', '#FF5252'];
export const BONUS_COLOR = '#FFD700';

export const GOOD_EMOJIS = ['💰', '💵', '🤑', '💎', '🪙', '💲', '🏆', '⭐'];
export const BOMB_EMOJIS = ['💣', '❌', '🚫', '☠️'];

export const TICKER_NAMES = [
  'mike_t', 'sarah_k', 'jamesR', 'ashley_m', 'chris_p', 'jess_l',
  'david_w', 'emma_s', 'ryan_b', 'olivia_h', 'nick_f', 'mia_c',
  'tyler_g', 'sophia_n', 'brandon_a', 'ava_d', 'josh_m', 'lily_r',
  'cash_king', 'money_mike', 'lucky_lucy', 'big_winner', 'profit_pro',
];

export const TICKER_ACTIONS = [
  (name: string, amt: string) => `${name} just cashed out $${amt}!`,
  (name: string, _: string, streak: number) => `${name} hit ${streak}x STREAK!`,
  (name: string, amt: string) => `${name} earned $${amt} in 30 seconds!`,
  (name: string, amt: string) => `${name} withdrew $${amt} to PayPal`,
  (name: string, _: string) => `${name} hit the JACKPOT!`,
];
