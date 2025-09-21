import { GAME_WIDTH, PLAYER_WIDTH } from '../constants';
import { Egg, Particle, FloatingText, GameStats } from '../types';

// This function provides a clean slate for the game state.
export const getInitialGameState = () => ({
  score: 0,
  lives: 3,
  playerX: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
  eggs: [] as Egg[],
  particles: [] as Particle[],
  floatingTexts: [] as FloatingText[],
  // Using a single input state object is cleaner than multiple boolean refs.
  inputState: { left: false, right: false, touchX: null as number | null },
  lastTime: performance.now(),
  spawnTimer: 0,
  screenShake: { magnitude: 0, duration: 0 },
  comboCounter: 0,
  comboActive: false,
  comboTimer: 0,
  slowMoTimer: 0,
  scoreMultiplier: 1,
  multiplierTimer: 0,
  gameStats: { goldenEggs: 0, bombsHit: 0, rottenHit: 0, starsCaught: 0 } as GameStats,
});

// We export the type for our state object for better type safety across modules.
export type GameStateRef = ReturnType<typeof getInitialGameState>;
