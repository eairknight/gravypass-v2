// ═══ V2: MONEY-FIRST CASINO GAME CONFIG ═══════════════════

export const OFFER_URL = 'https://blue-host-media.com/cf/click';

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

// Scoring — feels rewarding but realistic (~$3-5 per session)
export const BASE_WIN = 0.02;
export const WIN_PER_STREAK = 0.003;
export const MAX_WIN_PER_TAP = 0.06;
export const MULTIPLIER_PER_STREAK = 0.12;
export const BONUS_MULTIPLIER = 2;

// Combo — easier to trigger, bigger rewards
export const COMBO_WINDOW_MS = 500;
export const COMBO_TIERS = [
  { min: 2, max: 4, bonus: 1.1 },
  { min: 5, max: 9, bonus: 1.2 },
  { min: 10, max: 19, bonus: 1.4 },
  { min: 20, max: Infinity, bonus: 1.6 },
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

// Milestones — scaled to realistic earnings
export const MILESTONES = [0.25, 0.50, 1, 2, 3, 5, 7, 10];

// Cashout progress bar target
export const CASHOUT_GOAL = 3.00;

// ═══ CASINO PSYCHOLOGY ═══════════════════════
export const JACKPOT_CHANCE_PER_TAP = 0.03;
export const JACKPOT_MIN_STREAK = 5;
export const JACKPOT_AMOUNTS = [0.05, 0.10, 0.15, 0.25, 0.50, 0.75, 1.00];
export const JACKPOT_WEIGHTS = [30, 25, 20, 12, 8, 3, 2];

export const HOT_STREAK_THRESHOLD = 4;
export const FIRE_STREAK_THRESHOLD = 8;
export const MEGA_STREAK_THRESHOLD = 15;

export const LUCKY_SPIN_STREAK = 10;
export const NEAR_WIN_CHANCE = 0.20;

export const FRENZY_THRESHOLD = 12;
export const FRENZY_BONUS = 1.3;

// Fake "live cashout" popups
export const CASHOUT_POPUP_INTERVAL_S = 8;
export const CASHOUT_POPUP_AMOUNTS = [
  '$1.80', '$2.40', '$3.10', '$4.50', '$2.90',
  '$3.70', '$5.20', '$1.95', '$4.10', '$3.60',
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

// ═══ GRAVY PASS BLUE BRAND THEME ═══════════════
export const COLORS = {
  bg1: '#0a1820',
  bg2: '#0f2230',
  bg3: '#153042',
  brand: '#3FC1E4',
  brandLight: '#6DD5ED',
  brandDark: '#2A9CC4',
  gold: '#FFD700',
  goldLight: '#FFED4A',
  green: '#22C55E',
  greenDark: '#16A34A',
  greenLight: '#4ADE80',
  red: '#FF1744',
  redDark: '#D50000',
  purple: '#7C4DFF',
  white: '#FFFFFF',
  dim: '#64748B',
  cash: '#4ADE80',
};

export const TILE_COLORS = ['#3FC1E4', '#22C55E', '#FFD700', '#6DD5ED', '#4ADE80', '#FFED4A'];
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
