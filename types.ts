
export enum GameState {
  NAME_INPUT = 'NAME_INPUT',
  START_MENU = 'START_MENU',
  INSTRUCTIONS = 'INSTRUCTIONS',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEADERBOARD = 'LEADERBOARD',
}

export enum EggType {
  NORMAL = 'NORMAL',
  GOLDEN = 'GOLDEN',
  ROTTEN = 'ROTTEN',
  BOMB = 'BOMB',
  HEART = 'HEART',
  CLOCK = 'CLOCK',
  STAR = 'STAR',
}

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
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}
