

import React, { useRef, useEffect, useCallback } from 'react';
import { Egg, EggType, FloatingText, Particle, GameStats } from '../types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  BASKET_WIDTH,
  BASKET_HEIGHT,
  BASKET_OFFSET_Y,
  EGG_WIDTH,
  EGG_HEIGHT,
  BOMB_RADIUS,
  INITIAL_EGG_SPEED,
  INITIAL_SPAWN_RATE,
  MAX_DIFFICULTY_SCORE,
  SCORE_NORMAL,
  SCORE_GOLDEN,
  COMBO_THRESHOLD,
  COMBO_DURATION,
  PRIMARY_COLOR,
  BACKGROUND_COLOR,
  ROTTEN_EGG_COLOR,
  GOLDEN_EGG_COLOR,
  BOMB_COLOR,
  LINE_WIDTH,
  HEART_WIDTH,
  HEART_HEIGHT,
  CLOCK_RADIUS,
  HEART_COLOR,
  CLOCK_COLOR,
  SLOW_MOTION_DURATION,
  SLOW_MOTION_FACTOR,
  MULTIPLIER_DURATION,
  SCORE_MULTIPLIER,
  STAR_WIDTH,
  STAR_HEIGHT,
  STAR_COLOR,
} from '../constants';
import Sfx from '../services/Sfx';

interface GameProps {
  onGameOver: (score: number, stats: GameStats) => void;
  onPause: () => void;
  isPaused: boolean;
}

const Game: React.FC<GameProps> = ({ onGameOver, onPause, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const sfx = useRef(new Sfx());

  // Game state refs
  const score = useRef(0);
  const lives = useRef(3);
  const playerX = useRef(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const eggs = useRef<Egg[]>([]);
  const particles = useRef<Particle[]>([]);
  const floatingTexts = useRef<FloatingText[]>([]);
  const inputState = useRef({ left: false, right: false, touchX: null as number | null });
  const lastTime = useRef(performance.now());
  const spawnTimer = useRef(0);
  const screenShake = useRef({ magnitude: 0, duration: 0 });
  const comboCounter = useRef(0);
  const comboActive = useRef(false);
  const comboTimer = useRef(0);
  const slowMoTimer = useRef(0);
  const scoreMultiplier = useRef(1);
  const multiplierTimer = useRef(0);
  const gameStats = useRef<GameStats>({ goldenEggs: 0, bombsHit: 0, rottenHit: 0, starsCaught: 0 });

  const drawDoodleText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string) => {
    ctx.font = `bold ${size}px 'Kalam', cursive`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };
  
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    const x = playerX.current;
    const y = GAME_HEIGHT - PLAYER_HEIGHT; // Top of player bounding box
    ctx.strokeStyle = PRIMARY_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = PRIMARY_COLOR;

    const centerX = x + PLAYER_WIDTH / 2;
    
    // Basket position is determined by game logic.
    const basketY = y + BASKET_OFFSET_Y;
    const basketX = centerX - BASKET_WIDTH / 2;

    // --- Build robot from the ground up to fit PLAYER_HEIGHT ---
    const playerBottom = y + PLAYER_HEIGHT;
    const legHeight = 20;
    const bodyHeight = 40;
    const headSize = 35;

    const legTopY = playerBottom - legHeight;
    const bodyTopY = legTopY - bodyHeight;
    const headTopY = bodyTopY - headSize;

    // --- Legs ---
    const bodyWidth = 40;
    ctx.beginPath();
    ctx.moveTo(centerX - bodyWidth / 4, legTopY);
    ctx.lineTo(centerX - bodyWidth / 4, playerBottom);
    ctx.moveTo(centerX + bodyWidth / 4, legTopY);
    ctx.lineTo(centerX + bodyWidth / 4, playerBottom);
    ctx.stroke();

    // --- Body ---
    ctx.beginPath();
    ctx.rect(centerX - bodyWidth / 2, bodyTopY, bodyWidth, bodyHeight);
    ctx.stroke();
    // Body detail
    ctx.beginPath();
    ctx.moveTo(centerX - bodyWidth/4, bodyTopY + 10);
    ctx.lineTo(centerX + bodyWidth/4, bodyTopY + 10);
    ctx.moveTo(centerX - bodyWidth/4, bodyTopY + bodyHeight - 10);
    ctx.lineTo(centerX + bodyWidth/4, bodyTopY + bodyHeight - 10);
    ctx.lineWidth = LINE_WIDTH - 2;
    ctx.stroke();
    ctx.lineWidth = LINE_WIDTH;
    
    // --- Head ---
    ctx.beginPath();
    ctx.rect(centerX - headSize / 2, headTopY, headSize, headSize);
    ctx.stroke();
    
    // Antenna
    ctx.beginPath();
    ctx.moveTo(centerX, headTopY);
    ctx.lineTo(centerX, headTopY - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, headTopY - 12, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    const eyeY = headTopY + headSize / 2;
    ctx.beginPath();
    ctx.arc(centerX, eyeY, headSize / 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, eyeY, headSize / 8, 0, Math.PI * 2);
    ctx.fill();
    
    // --- Arms ---
    ctx.beginPath();
    ctx.moveTo(centerX - bodyWidth / 2, bodyTopY + 10);
    ctx.lineTo(basketX + 5, basketY + BASKET_HEIGHT / 2);
    ctx.moveTo(centerX + bodyWidth / 2, bodyTopY + 10);
    ctx.lineTo(basketX + BASKET_WIDTH - 5, basketY + BASKET_HEIGHT / 2);
    ctx.stroke();

    // --- Basket ---
    ctx.beginPath();
    ctx.moveTo(basketX, basketY);
    ctx.lineTo(basketX, basketY + BASKET_HEIGHT);
    ctx.arcTo(centerX, basketY + BASKET_HEIGHT + 15, basketX + BASKET_WIDTH, basketY + BASKET_HEIGHT, 30);
    ctx.lineTo(basketX + BASKET_WIDTH, basketY);
    ctx.stroke();
  };
  
  const drawFallingItem = (ctx: CanvasRenderingContext2D, item: Egg) => {
    ctx.lineWidth = LINE_WIDTH - 2;
    ctx.shadowBlur = 0;

    const drawEllipse = () => {
        ctx.beginPath();
        ctx.ellipse(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, item.height / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
    };

    switch (item.type) {
      case EggType.GOLDEN:
        ctx.strokeStyle = GOLDEN_EGG_COLOR;
        ctx.shadowColor = GOLDEN_EGG_COLOR;
        ctx.shadowBlur = 10;
        drawEllipse();
        break;
      case EggType.ROTTEN:
        ctx.strokeStyle = ROTTEN_EGG_COLOR;
        drawEllipse();
        break;
      case EggType.BOMB:
        ctx.fillStyle = BOMB_COLOR;
        ctx.strokeStyle = ROTTEN_EGG_COLOR;
        ctx.beginPath();
        ctx.arc(item.x + BOMB_RADIUS, item.y + BOMB_RADIUS, BOMB_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(item.x + BOMB_RADIUS, item.y);
        ctx.quadraticCurveTo(item.x + BOMB_RADIUS + 10, item.y - 10, item.x + BOMB_RADIUS + 5, item.y - 15);
        ctx.stroke();
        break;
      case EggType.HEART:
        ctx.strokeStyle = HEART_COLOR;
        ctx.beginPath();
        const topCurveHeight = HEART_HEIGHT * 0.3;
        ctx.moveTo(item.x + HEART_WIDTH / 2, item.y + topCurveHeight);
        ctx.bezierCurveTo(item.x, item.y, item.x, item.y + HEART_HEIGHT / 2, item.x + HEART_WIDTH / 2, item.y + HEART_HEIGHT);
        ctx.bezierCurveTo(item.x + HEART_WIDTH, item.y + HEART_HEIGHT / 2, item.x + HEART_WIDTH, item.y, item.x + HEART_WIDTH / 2, item.y + topCurveHeight);
        ctx.closePath();
        ctx.stroke();
        break;
      case EggType.CLOCK:
        ctx.strokeStyle = CLOCK_COLOR;
        ctx.beginPath();
        ctx.arc(item.x + CLOCK_RADIUS, item.y + CLOCK_RADIUS, CLOCK_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(item.x + CLOCK_RADIUS, item.y + CLOCK_RADIUS);
        ctx.lineTo(item.x + CLOCK_RADIUS, item.y + 5);
        ctx.moveTo(item.x + CLOCK_RADIUS, item.y + CLOCK_RADIUS);
        ctx.lineTo(item.x + CLOCK_RADIUS + 10, item.y + CLOCK_RADIUS);
        ctx.stroke();
        break;
      case EggType.STAR:
        ctx.strokeStyle = STAR_COLOR;
        ctx.fillStyle = STAR_COLOR + '80'; // semi-transparent fill
        ctx.lineWidth = 4;
        ctx.shadowColor = STAR_COLOR;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        const spikes = 5;
        const outerRadius = item.width / 2;
        const innerRadius = outerRadius / 2;
        let rot = Math.PI / 2 * 3;
        const cx = item.x + item.width / 2;
        const cy = item.y + item.height / 2;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        for (let i = 0; i < spikes * 2; i++) {
            const radius = (i % 2 === 0) ? outerRadius : innerRadius;
            x = cx + Math.cos(rot) * radius;
            y = cy + Math.sin(rot) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            rot += step;
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        break;
      default:
        ctx.strokeStyle = PRIMARY_COLOR;
        drawEllipse();
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  };

  const drawUI = (ctx: CanvasRenderingContext2D) => {
    drawDoodleText(ctx, `Score: ${score.current}`, 20, 40, 30, PRIMARY_COLOR);

    for (let i = 0; i < lives.current; i++) {
        ctx.strokeStyle = PRIMARY_COLOR;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(GAME_WIDTH - 40 - i * 45, 30, EGG_WIDTH / 2.5, EGG_HEIGHT / 2.5, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    const difficultyProgress = Math.min(score.current / MAX_DIFFICULTY_SCORE, 1);
    ctx.fillStyle = PRIMARY_COLOR;
    ctx.fillRect(0, 0, GAME_WIDTH * difficultyProgress, 5);

    if (comboCounter.current > 0) {
        const comboProgress = comboCounter.current / COMBO_THRESHOLD;
        const barWidth = 200;
        const barX = GAME_WIDTH / 2 - barWidth / 2;
        ctx.strokeStyle = PRIMARY_COLOR;
        ctx.lineWidth = 3;
        ctx.strokeRect(barX, 55, barWidth, 15);
        ctx.fillStyle = comboActive.current ? GOLDEN_EGG_COLOR : PRIMARY_COLOR;
        ctx.fillRect(barX, 55, barWidth * Math.min(comboProgress, 1), 15);
    }
    
    if (comboActive.current) {
        drawDoodleText(ctx, 'COMBO x2!', GAME_WIDTH / 2 - 100, 45, 40, GOLDEN_EGG_COLOR);
    } else if (scoreMultiplier.current > 1) {
        drawDoodleText(ctx, `SCORE x${scoreMultiplier.current}!`, GAME_WIDTH / 2 - 100, 45, 40, STAR_COLOR);
    }

    if (slowMoTimer.current > 0) {
        const slowMoProgress = slowMoTimer.current / SLOW_MOTION_DURATION;
        ctx.fillStyle = `${CLOCK_COLOR}80`;
        ctx.fillRect(0, GAME_HEIGHT - 10, GAME_WIDTH * slowMoProgress, 10);
    }
    if (multiplierTimer.current > 0) {
        const multiplierProgress = multiplierTimer.current / MULTIPLIER_DURATION;
        ctx.fillStyle = `${STAR_COLOR}80`;
        ctx.fillRect(0, GAME_HEIGHT - 10, GAME_WIDTH * multiplierProgress, 10);
    }
  };

  const addFloatingText = (text: string, x: number, y: number) => {
    floatingTexts.current.push({ id: Date.now() + Math.random(), text, x, y, vy: -50, opacity: 1, life: 1 });
  };

  const triggerScreenShake = (magnitude: number, duration: number) => {
      screenShake.current = { magnitude, duration };
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.current.push({
            id: Math.random(), x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 2,
            color,
            life: Math.random() * 0.5 + 0.5,
            opacity: 1,
        });
    }
  };

  const spawnItem = useCallback(() => {
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
    
    eggs.current.push({
      id: Date.now() + Math.random(), type, x: Math.random() * (GAME_WIDTH - width),
      y: -height, width, height, vy: 0, vx: (Math.random() - 0.5) * 60,
    });
  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    const dt = (currentTime - lastTime.current) / 1000;
    lastTime.current = currentTime;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const logicDt = slowMoTimer.current > 0 ? dt * SLOW_MOTION_FACTOR : dt;
    
    if (!isPaused) {
        if (inputState.current.touchX !== null) {
            playerX.current += (inputState.current.touchX - PLAYER_WIDTH / 2 - playerX.current) * 0.2;
        } else {
            if (inputState.current.left) playerX.current -= PLAYER_SPEED * dt;
            if (inputState.current.right) playerX.current += PLAYER_SPEED * dt;
        }
        playerX.current = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, playerX.current));

        const difficulty = Math.min(score.current / MAX_DIFFICULTY_SCORE, 1);
        const currentSpawnRate = INITIAL_SPAWN_RATE - (INITIAL_SPAWN_RATE - 0.3) * difficulty;
        spawnTimer.current += logicDt;
        if (spawnTimer.current > currentSpawnRate) {
            spawnTimer.current = 0;
            spawnItem();
        }

        if (slowMoTimer.current > 0) {
            slowMoTimer.current -= dt * 1000;
            if (slowMoTimer.current < 0) slowMoTimer.current = 0;
        }
        
        if (multiplierTimer.current > 0) {
            multiplierTimer.current -= dt * 1000;
            if (multiplierTimer.current <= 0) {
                scoreMultiplier.current = 1;
            }
        }

        const eggBaseSpeed = INITIAL_EGG_SPEED + (300 * difficulty);
        eggs.current.forEach(egg => {
            egg.vy = eggBaseSpeed;
            egg.y += egg.vy * logicDt;
            egg.x += egg.vx * logicDt;
            if (egg.x <= 0 || egg.x + egg.width >= GAME_WIDTH) {
                egg.vx *= -1;
                egg.x = Math.max(0, Math.min(GAME_WIDTH - egg.width, egg.x));
            }
        });
        
        floatingTexts.current.forEach(t => { t.y += t.vy * dt; t.life -= dt; t.opacity = Math.max(0, t.life); });
        floatingTexts.current = floatingTexts.current.filter(t => t.life > 0);
        
        if (comboActive.current) {
            comboTimer.current -= dt * 1000;
            if (comboTimer.current <= 0) comboActive.current = false;
        }

        const basket = { x: playerX.current + (PLAYER_WIDTH - BASKET_WIDTH) / 2, y: GAME_HEIGHT - PLAYER_HEIGHT + BASKET_OFFSET_Y, width: BASKET_WIDTH, height: BASKET_HEIGHT };
        const caughtEggs = new Set<number>();
        eggs.current.forEach(egg => {
            if (egg.y + egg.height > basket.y && egg.y < basket.y + basket.height && egg.x + egg.width > basket.x && egg.x < basket.x + basket.width) {
                caughtEggs.add(egg.id);
                let pointsEarned = 0; let particleColor = PRIMARY_COLOR; let particleCount = 10;
                switch(egg.type) {
                    case EggType.NORMAL: pointsEarned = SCORE_NORMAL; sfx.current.playCatch(); break;
                    case EggType.GOLDEN: pointsEarned = SCORE_GOLDEN; gameStats.current.goldenEggs++; sfx.current.playGoldenCatch(); particleColor = GOLDEN_EGG_COLOR; particleCount = 20; break;
                    case EggType.ROTTEN: lives.current--; gameStats.current.rottenHit++; sfx.current.playRottenCatch(); triggerScreenShake(8, 200); createParticles(egg.x + egg.width/2, egg.y + egg.height/2, ROTTEN_EGG_COLOR, 15); break;
                    case EggType.BOMB: lives.current--; gameStats.current.bombsHit++; sfx.current.playBomb(); triggerScreenShake(20, 500); createParticles(egg.x + egg.width/2, egg.y + egg.height/2, BOMB_COLOR, 30); break;
                    case EggType.HEART: if (lives.current < 3) lives.current++; sfx.current.playHeartCatch(); addFloatingText('+1 ♥', egg.x, egg.y); particleColor = HEART_COLOR; break;
                    case EggType.CLOCK: slowMoTimer.current = SLOW_MOTION_DURATION; sfx.current.playClockCatch(); addFloatingText('SLOW!', egg.x, egg.y); particleColor = CLOCK_COLOR; break;
                    case EggType.STAR:
                        multiplierTimer.current = MULTIPLIER_DURATION;
                        scoreMultiplier.current = SCORE_MULTIPLIER;
                        gameStats.current.starsCaught++;
                        sfx.current.playStarCatch();
                        addFloatingText(`x${SCORE_MULTIPLIER} SCORE!`, egg.x, egg.y);
                        particleColor = STAR_COLOR;
                        particleCount = 30;
                        break;
                }
                if (pointsEarned > 0) {
                    comboCounter.current++;
                    if (comboCounter.current >= COMBO_THRESHOLD) { comboActive.current = true; comboTimer.current = COMBO_DURATION; }
                    let finalPoints = pointsEarned;
                    if (comboActive.current) finalPoints *= 2;
                    finalPoints *= scoreMultiplier.current;
                    score.current += finalPoints;
                    addFloatingText(`+${finalPoints}`, egg.x, egg.y);
                    createParticles(egg.x + egg.width/2, egg.y + egg.height/2, particleColor, particleCount);
                }
            }
        });
        
        const missedEggs = new Set<number>();
        eggs.current.forEach(egg => {
           if (egg.y > GAME_HEIGHT) {
               missedEggs.add(egg.id);
               if (egg.type !== EggType.ROTTEN && egg.type !== EggType.BOMB && egg.type !== EggType.HEART && egg.type !== EggType.CLOCK && egg.type !== EggType.STAR) {
                   lives.current--; comboCounter.current = 0; comboActive.current = false;
                   sfx.current.playMiss(); triggerScreenShake(8, 200);
               }
           }
        });
        eggs.current = eggs.current.filter(e => !caughtEggs.has(e.id) && !missedEggs.has(e.id));
        
        if (lives.current <= 0) { onGameOver(score.current, gameStats.current); return; }

        if (screenShake.current.duration > 0) { screenShake.current.duration -= dt * 1000; } else { screenShake.current.magnitude = 0; }
    }
    
    // --- DRAW ---
    particles.current.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= dt; p.opacity = p.life; });
    particles.current = particles.current.filter(p => p.life > 0);

    ctx.save();
    if(screenShake.current.magnitude > 0) ctx.translate((Math.random() - 0.5) * screenShake.current.magnitude, (Math.random() - 0.5) * screenShake.current.magnitude);
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawPlayer(ctx);
    eggs.current.forEach(egg => drawFallingItem(ctx, egg));
    drawParticles(ctx);
    floatingTexts.current.forEach(text => { ctx.globalAlpha = text.opacity; drawDoodleText(ctx, text.text, text.x, text.y, 24, PRIMARY_COLOR); ctx.globalAlpha = 1.0; });
    drawUI(ctx);
    ctx.restore();
    
    requestAnimationFrame(gameLoop);
  }, [isPaused, onGameOver, onPause]);
  
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current; const container = gameContainerRef.current;
    if (canvas && container) {
      const { width, height } = container.getBoundingClientRect(); const scale = Math.min(width / GAME_WIDTH, height / GAME_HEIGHT);
      canvas.style.width = `${GAME_WIDTH * scale}px`; canvas.style.height = `${GAME_HEIGHT * scale}px`;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if(canvas) { canvas.width = GAME_WIDTH; canvas.height = GAME_HEIGHT; }
    window.addEventListener('resize', handleResize); handleResize();
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'a' || e.key === 'ArrowLeft') inputState.current.left = true;
        if (e.key === 'd' || e.key === 'ArrowRight') inputState.current.right = true;
        if (e.key === 'p' || e.key === 'P') onPause();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'a' || e.key === 'ArrowLeft') inputState.current.left = false;
        if (e.key === 'd' || e.key === 'ArrowRight') inputState.current.right = false;
    };
    const getTouchX = (e: TouchEvent) => { const canvas = canvasRef.current; if (!canvas) return null; const rect = canvas.getBoundingClientRect(); return (e.touches[0].clientX - rect.left) / (rect.width / GAME_WIDTH); }
    const handleTouchStart = (e: TouchEvent) => { inputState.current.touchX = getTouchX(e); };
    const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); inputState.current.touchX = getTouchX(e); };
    const handleTouchEnd = () => { inputState.current.touchX = null; };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart); window.addEventListener('touchmove', handleTouchMove, { passive: false }); window.addEventListener('touchend', handleTouchEnd);
    requestAnimationFrame(gameLoop);
    return () => {
        window.removeEventListener('resize', handleResize); window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp); window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove); window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameLoop, handleResize, onPause]);
  
  return (
    <div ref={gameContainerRef} className="w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} className="bg-white"></canvas>
    </div>
  );
};

export default Game;