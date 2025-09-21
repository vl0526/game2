

export enum GameState {
  AUTH = 'AUTH',
  START_MENU = 'START_MENU',
  INSTRUCTIONS = 'INSTRUCTIONS',
  LEADERBOARD = 'LEADERBOARD',
  SHOP = 'SHOP',
  LOCKER = 'LOCKER',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum EggType {
  NORMAL = 'NORMAL',
  GOLDEN = 'GOLDEN',
  ROTTEN = 'ROTTEN',
  BOMB = 'BOMB',
  HEART = 'HEART',
  CLOCK = 'CLOCK',
  STAR = 'STAR',
  MAGNET = 'MAGNET', // New item
  // FIX: Add missing FRENZY type for older components.
  FRENZY = 'FRENZY',
}

export type PowerUpType = EggType.CLOCK | EggType.STAR | EggType.MAGNET;

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Egg extends GameObject {
  id: number;
  type: EggType;
  vy: number; // vertical velocity
  vx: number; // horizontal velocity
  isAttracted?: boolean; // For magnet effect
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  opacity: number;
  life: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  opacity: number;
}

export interface GameStats {
  goldenEggs: number;
  bombsHit: number;
  rottenHit: number;
  starsCaught: number;
  magnetsCaught: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}

// New types for user, shop, and inventory
export type Skin = 'robot' | 'stickman';
export type Accessory = 'top_hat' | 'sunglasses';

export interface User {
  name: string;
  isAdmin: boolean;
  coins: number;
  highScore: number;
  ownedSkins: Skin[];
  ownedAccessories: Accessory[];
  equippedSkin: Skin;
  equippedAccessories: Accessory[];
}

export type ShopCategory = 'Skins' | 'Accessories' | 'Power-ups';

export interface ShopItem {
  id: Skin | Accessory | PowerUpType;
  name: string;
  price: number;
  category: ShopCategory;
  description: string;
}
