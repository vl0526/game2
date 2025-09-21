import {
  GAME_WIDTH, GAME_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, BASKET_WIDTH, BASKET_HEIGHT, BASKET_OFFSET_Y,
  MAX_DIFFICULTY_SCORE, INITIAL_EGG_SPEED, INITIAL_SPAWN_RATE,
  SLOW_MOTION_DURATION, MULTIPLIER_DURATION, SCORE_MULTIPLIER, COMBO_DURATION, COMBO_THRESHOLD,
  SCORE_NORMAL, SCORE_GOLDEN, EGG_WIDTH, EGG_HEIGHT, BOMB_RADIUS, HEART_WIDTH, HEART_HEIGHT, CLOCK_RADIUS, STAR_WIDTH, STAR_HEIGHT
} from '../constants';
import { Egg, EggType } from '../types';
import { GameStateRef } from './state';

export type GameEvent = 
  | { type: 'CATCH_NORMAL'; position: { x: number, y: number } }
  | { type: 'CATCH_GOLDEN'; position: { x: number, y: number } }
  | { type: 'CATCH_ROTTEN'; position: { x: number, y: number } }
  | { type: 'CATCH_BOMB'; position: { x: number, y: number } }
  | { type: 'CATCH_HEART'; position: { x: number, y: number } }
  | { type: 'CATCH_CLOCK'; position: { x: number, y: number } }
  | { type: 'CATCH_STAR'; position: { x: number, y: number } }
  | { type: 'MISS' }
  | { type: 'ADD_SCORE'; position: { x: number, y: number }; amount: number };

const spawnItem = (state: GameStateRef) => {
    const rand = Math.random();
    let type: EggType;
    if (rand < 0.02) type = EggType.HEART;
    else if (rand < 0.05) type = EggType.CLOCK;
    else if (rand < 0.09) type = EggType.STAR;
    else if (rand < 0.15) type = EggType.BOMB;
    else if (rand < 0.25) type = EggType.GOLDEN;
    else if (rand < 0.40) type = EggType.ROTTEN;
    else type = EggType.NORMAL;

    let width, height;
    switch(type) {
        case EggType.BOMB: width = height = BOMB_RADIUS * 2; break;
        case EggType.HEART: width = HEART_WIDTH; height = HEART_HEIGHT; break;
        case EggType.CLOCK: width = height = CLOCK_RADIUS * 2; break;
        case EggType.STAR: width = STAR_WIDTH; height = STAR_HEIGHT; break;
        default: width = EGG_WIDTH; height = EGG_HEIGHT;
    }
    
    state.eggs.push({
      id: Date.now() + Math.random(), type, x: Math.random() * (GAME_WIDTH - width),
      y: -height, width, height, vy: 0, vx: (Math.random() - 0.5) * 60,
    });
};

const processCatch = (egg: Egg, state: GameStateRef, events: GameEvent[]) => {
    let pointsEarned = 0;
    
    switch(egg.type) {
        case EggType.NORMAL: pointsEarned = SCORE_NORMAL; events.push({type: 'CATCH_NORMAL', position: {x: egg.x, y: egg.y}}); break;
        case EggType.GOLDEN: pointsEarned = SCORE_GOLDEN; state.gameStats.goldenEggs++; events.push({type: 'CATCH_GOLDEN', position: {x: egg.x, y: egg.y}}); break;
        case EggType.ROTTEN: state.lives--; state.gameStats.rottenHit++; events.push({type: 'CATCH_ROTTEN', position: {x: egg.x, y: egg.y}}); break;
        case EggType.BOMB: state.lives--; state.gameStats.bombsHit++; events.push({type: 'CATCH_BOMB', position: {x: egg.x, y: egg.y}}); break;
        case EggType.HEART: if (state.lives < 3) state.lives++; events.push({type: 'CATCH_HEART', position: {x: egg.x, y: egg.y}}); break;
        case EggType.CLOCK: state.slowMoTimer = SLOW_MOTION_DURATION; events.push({type: 'CATCH_CLOCK', position: {x: egg.x, y: egg.y}}); break;
        case EggType.STAR:
            state.multiplierTimer = MULTIPLIER_DURATION;
            state.scoreMultiplier = SCORE_MULTIPLIER;
            state.gameStats.starsCaught++;
            events.push({type: 'CATCH_STAR', position: {x: egg.x, y: egg.y}});
            break;
    }
    
    if (pointsEarned > 0) {
        state.comboCounter++;
        if (state.comboCounter >= COMBO_THRESHOLD) { 
            state.comboActive = true; 
            state.comboTimer = COMBO_DURATION; 
        }
        let finalPoints = pointsEarned;
        if (state.comboActive) finalPoints *= 2;
        finalPoints *= state.scoreMultiplier;
        state.score += finalPoints;
        events.push({type: 'ADD_SCORE', amount: finalPoints, position: {x: egg.x, y: egg.y}});
    } else {
        state.comboCounter = 0;
        state.comboActive = false;
    }
};

const processMiss = (egg: Egg, state: GameStateRef, events: GameEvent[]) => {
    if (egg.type === EggType.NORMAL || egg.type === EggType.GOLDEN) {
        state.lives--;
        state.comboCounter = 0;
        state.comboActive = false;
        events.push({type: 'MISS'});
    }
};

const handleCollisionsAndMisses = (state: GameStateRef, events: GameEvent[]) => {
    const basket = { 
        x: state.playerX + (PLAYER_WIDTH - BASKET_WIDTH) / 2, 
        y: GAME_HEIGHT - PLAYER_HEIGHT + BASKET_OFFSET_Y, 
        width: BASKET_WIDTH, 
        height: BASKET_HEIGHT 
    };
    
    const caughtEggs = new Set<number>();
    const missedEggs = new Set<number>();

    for (const egg of state.eggs) {
        if (egg.y + egg.height > basket.y && egg.y < basket.y + basket.height && egg.x + egg.width > basket.x && egg.x < basket.x + basket.width) {
            caughtEggs.add(egg.id);
            processCatch(egg, state, events);
        }
        else if (egg.y > GAME_HEIGHT) {
            missedEggs.add(egg.id);
            processMiss(egg, state, events);
        }
    }
    
    state.eggs = state.eggs.filter(e => !caughtEggs.has(e.id) && !missedEggs.has(e.id));
};

export const updateGameLogic = (state: GameStateRef, dt: number, logicDt: number): GameEvent[] => {
    const events: GameEvent[] = [];

    // 1. Update Player Position
    if (state.inputState.touchX !== null) {
        state.playerX += (state.inputState.touchX - PLAYER_WIDTH / 2 - state.playerX) * 0.2;
    } else {
        if (state.inputState.left) state.playerX -= PLAYER_SPEED * dt;
        if (state.inputState.right) state.playerX += PLAYER_SPEED * dt;
    }
    state.playerX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, state.playerX));

    // 2. Update Spawning
    const difficulty = Math.min(state.score / MAX_DIFFICULTY_SCORE, 1);
    const currentSpawnRate = INITIAL_SPAWN_RATE - (INITIAL_SPAWN_RATE - 0.3) * difficulty;
    state.spawnTimer += logicDt;
    if (state.spawnTimer > currentSpawnRate) {
        state.spawnTimer = 0;
        spawnItem(state);
    }

    // 3. Update Power-up Timers
    if (state.slowMoTimer > 0) state.slowMoTimer = Math.max(0, state.slowMoTimer - dt * 1000);
    if (state.multiplierTimer > 0) {
        state.multiplierTimer = Math.max(0, state.multiplierTimer - dt * 1000);
        if (state.multiplierTimer === 0) state.scoreMultiplier = 1;
    }
    if (state.comboActive) {
        state.comboTimer = Math.max(0, state.comboTimer - dt * 1000);
        if (state.comboTimer === 0) state.comboActive = false;
    }

    // 4. Update Falling Item Positions
    const eggBaseSpeed = INITIAL_EGG_SPEED + (300 * difficulty);
    state.eggs.forEach(egg => {
        egg.vy = eggBaseSpeed;
        egg.y += egg.vy * logicDt;
        egg.x += egg.vx * logicDt;
        if (egg.x <= 0 || egg.x + egg.width >= GAME_WIDTH) {
            egg.vx *= -1;
            egg.x = Math.max(0, Math.min(GAME_WIDTH - egg.width, egg.x));
        }
    });

    // 5. Handle Collisions & Misses
    handleCollisionsAndMisses(state, events);

    return events;
};
