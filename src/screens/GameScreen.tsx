
import React, { useRef, useEffect, useCallback } from 'react';
import { Egg, EggType, FloatingText, Particle, GameStats, PowerUpType } from '../types';
import * as C from '../constants';
import Sfx from '../services/Sfx';
import { useAuth } from '../hooks/useAuth';

interface GameProps {
  onGameOver: (score: number, stats: GameStats) => void;
  onPause: () => void;
  isPaused: boolean;
}

const GameScreen: React.FC<GameProps> = ({ onGameOver, onPause, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const sfx = useRef(new Sfx());

  // Game state refs
  const score = useRef(0);
  const lives = useRef(user?.isAdmin ? 99 : 3);
  const playerX = useRef(C.GAME_WIDTH / 2 - C.PLAYER_WIDTH / 2);
  const eggs = useRef<Egg[]>([]);
  const particles = useRef<Particle[]>([]);
  const floatingTexts = useRef<FloatingText[]>([]);
  const inventory = useRef<(PowerUpType | null)[]>(new Array(C.INVENTORY_SIZE).fill(null));
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
  const magnetTimer = useRef(0);
  const gameStats = useRef<GameStats>({ goldenEggs: 0, bombsHit: 0, rottenHit: 0, starsCaught: 0, magnetsCaught: 0 });

  const drawDoodleText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string) => {
    ctx.font = `bold ${size}px 'Kalam', cursive`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };
  
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    if (!user) return;
    const x = playerX.current;
    const y = C.GAME_HEIGHT - C.PLAYER_HEIGHT;
    ctx.strokeStyle = C.PRIMARY_COLOR;
    ctx.lineWidth = C.LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = C.PRIMARY_COLOR;

    const centerX = x + C.PLAYER_WIDTH / 2;
    const basketY = y + C.BASKET_OFFSET_Y;
    const basketX = centerX - C.BASKET_WIDTH / 2;

    // --- Draw based on skin ---
    if (user.equippedSkin === 'stickman') {
      const headRadius = 18;
      const bodyTopY = y + headRadius * 2;
      const bodyBottomY = y + C.PLAYER_HEIGHT - 20;
      // Head
      ctx.beginPath(); ctx.arc(centerX, y + headRadius, headRadius, 0, Math.PI * 2); ctx.stroke();
      // Body
      ctx.beginPath(); ctx.moveTo(centerX, bodyTopY); ctx.lineTo(centerX, bodyBottomY); ctx.stroke();
      // Legs
      ctx.beginPath(); ctx.moveTo(centerX, bodyBottomY); ctx.lineTo(centerX - 15, bodyBottomY + 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(centerX, bodyBottomY); ctx.lineTo(centerX + 15, bodyBottomY + 20); ctx.stroke();
      // Arms
      ctx.beginPath(); ctx.moveTo(centerX, bodyTopY + 10); ctx.lineTo(basketX + 5, basketY + C.BASKET_HEIGHT / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(centerX, bodyTopY + 10); ctx.lineTo(basketX + C.BASKET_WIDTH - 5, basketY + C.BASKET_HEIGHT / 2); ctx.stroke();
    } else { // 'robot' skin
      const playerBottom = y + C.PLAYER_HEIGHT;
      const legHeight = 20, bodyHeight = 40, headSize = 35;
      const legTopY = playerBottom - legHeight, bodyTopY = legTopY - bodyHeight, headTopY = bodyTopY - headSize;
      const bodyWidth = 40;
      ctx.beginPath(); ctx.moveTo(centerX - bodyWidth/4, legTopY); ctx.lineTo(centerX - bodyWidth/4, playerBottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(centerX + bodyWidth/4, legTopY); ctx.lineTo(centerX + bodyWidth/4, playerBottom); ctx.stroke();
      ctx.beginPath(); ctx.rect(centerX - bodyWidth/2, bodyTopY, bodyWidth, bodyHeight); ctx.stroke();
      ctx.beginPath(); ctx.rect(centerX - headSize/2, headTopY, headSize, headSize); ctx.stroke();
      const eyeY = headTopY + headSize/2;
      ctx.beginPath(); ctx.arc(centerX, eyeY, headSize/4, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(centerX, eyeY, headSize/8, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(centerX - bodyWidth/2, bodyTopY+10); ctx.lineTo(basketX + 5, basketY + C.BASKET_HEIGHT/2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(centerX + bodyWidth/2, bodyTopY+10); ctx.lineTo(basketX + C.BASKET_WIDTH - 5, basketY + C.BASKET_HEIGHT/2); ctx.stroke();
    }

    // --- Draw accessories ---
    if(user.equippedAccessories.includes('top_hat')) {
      ctx.fillStyle = '#111';
      ctx.fillRect(centerX - 20, y - 20, 40, 25);
      ctx.fillRect(centerX - 28, y, 56, 5);
    }
    if(user.equippedAccessories.includes('sunglasses')) {
      ctx.fillStyle = '#111';
      ctx.fillRect(centerX - 18, y + 15, 36, 10);
    }
    
    // --- Basket is always drawn ---
    ctx.beginPath(); ctx.moveTo(basketX, basketY); ctx.lineTo(basketX, basketY + C.BASKET_HEIGHT);
    ctx.arcTo(centerX, basketY + C.BASKET_HEIGHT + 15, basketX + C.BASKET_WIDTH, basketY + C.BASKET_HEIGHT, 30);
    ctx.lineTo(basketX + C.BASKET_WIDTH, basketY); ctx.stroke();

    // --- Magnet Effect ---
    if (magnetTimer.current > 0) {
        ctx.save();
        const magnetRadius = C.BASKET_WIDTH * 2;
        const gradient = ctx.createRadialGradient(centerX, basketY, 10, centerX, basketY, magnetRadius);
        const alpha = Math.min(1, magnetTimer.current / 1000) * 0.4;
        gradient.addColorStop(0, `${C.MAGNET_COLOR}00`);
        gradient.addColorStop(0.8, `${C.MAGNET_COLOR}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${C.MAGNET_COLOR}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, basketY, magnetRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
  };
  
  const drawFallingItem = (ctx: CanvasRenderingContext2D, item: Egg) => { /* ... existing drawFallingItem logic ... updated for magnet */ 
    ctx.lineWidth = C.LINE_WIDTH - 2;
    ctx.shadowBlur = 0;
    const drawEllipse = () => { ctx.beginPath(); ctx.ellipse(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, item.height / 2, 0, 0, Math.PI * 2); ctx.stroke(); };
    switch (item.type) {
        case EggType.GOLDEN: ctx.strokeStyle = C.GOLDEN_EGG_COLOR; ctx.shadowColor = C.GOLDEN_EGG_COLOR; ctx.shadowBlur = 10; drawEllipse(); break;
        case EggType.ROTTEN: ctx.strokeStyle = C.ROTTEN_EGG_COLOR; drawEllipse(); break;
        case EggType.BOMB:
            ctx.fillStyle = C.BOMB_COLOR; ctx.strokeStyle = C.ROTTEN_EGG_COLOR;
            ctx.beginPath(); ctx.arc(item.x + C.BOMB_RADIUS, item.y + C.BOMB_RADIUS, C.BOMB_RADIUS, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(item.x+C.BOMB_RADIUS, item.y); ctx.quadraticCurveTo(item.x+C.BOMB_RADIUS+10, item.y-10, item.x+C.BOMB_RADIUS+5, item.y-15); ctx.stroke();
            break;
        case EggType.HEART:
            ctx.strokeStyle = C.HEART_COLOR; ctx.beginPath();
            const tcH = C.HEART_HEIGHT * 0.3;
            ctx.moveTo(item.x + C.HEART_WIDTH/2, item.y + tcH);
            ctx.bezierCurveTo(item.x, item.y, item.x, item.y + C.HEART_HEIGHT/2, item.x + C.HEART_WIDTH/2, item.y + C.HEART_HEIGHT);
            ctx.bezierCurveTo(item.x+C.HEART_WIDTH, item.y+C.HEART_HEIGHT/2, item.x+C.HEART_WIDTH, item.y, item.x+C.HEART_WIDTH/2, item.y+tcH);
            ctx.closePath(); ctx.stroke();
            break;
        case EggType.CLOCK:
            ctx.strokeStyle = C.CLOCK_COLOR; ctx.beginPath();
            ctx.arc(item.x+C.CLOCK_RADIUS, item.y+C.CLOCK_RADIUS, C.CLOCK_RADIUS, 0, Math.PI*2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(item.x+C.CLOCK_RADIUS, item.y+C.CLOCK_RADIUS); ctx.lineTo(item.x+C.CLOCK_RADIUS, item.y+5);
            ctx.moveTo(item.x+C.CLOCK_RADIUS, item.y+C.CLOCK_RADIUS); ctx.lineTo(item.x+C.CLOCK_RADIUS+10, item.y+C.CLOCK_RADIUS); ctx.stroke();
            break;
        case EggType.STAR:
            ctx.strokeStyle = C.STAR_COLOR; ctx.fillStyle = C.STAR_COLOR + '80'; ctx.lineWidth = 4;
            ctx.shadowColor = C.STAR_COLOR; ctx.shadowBlur = 15; ctx.beginPath();
            const spikes = 5, outerRadius = item.width/2, innerRadius = outerRadius/2;
            let rot = Math.PI/2*3, cx = item.x+item.width/2, cy = item.y+item.height/2, step = Math.PI/spikes;
            for(let i=0; i<spikes*2; i++){
                const radius = (i%2===0) ? outerRadius : innerRadius;
                const x = cx + Math.cos(rot)*radius, y = cy + Math.sin(rot)*radius;
                if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                rot += step;
            }
            ctx.closePath(); ctx.stroke(); ctx.fill();
            break;
        case EggType.MAGNET:
            ctx.strokeStyle = C.MAGNET_COLOR; ctx.lineWidth = 4; ctx.shadowColor = C.MAGNET_COLOR; ctx.shadowBlur = 10;
            const legH = C.MAGNET_HEIGHT * 0.4;
            ctx.beginPath();
            ctx.arc(item.x + C.MAGNET_WIDTH/2, item.y + C.MAGNET_HEIGHT/2, C.MAGNET_WIDTH/2 - C.LINE_WIDTH/2, Math.PI, 0);
            ctx.lineTo(item.x + C.MAGNET_WIDTH - C.LINE_WIDTH/2, item.y + C.MAGNET_HEIGHT);
            ctx.moveTo(item.x + C.LINE_WIDTH/2, item.y + C.MAGNET_HEIGHT/2);
            ctx.lineTo(item.x + C.LINE_WIDTH/2, item.y + C.MAGNET_HEIGHT);
            ctx.stroke();
            break;
        default: ctx.strokeStyle = C.PRIMARY_COLOR; drawEllipse();
    }
  };

  const drawUI = (ctx: CanvasRenderingContext2D) => { /* ... existing UI drawing ... updated for inventory */
    drawDoodleText(ctx, `Điểm: ${score.current}`, 20, 40, 30, C.PRIMARY_COLOR);
    for (let i = 0; i < lives.current; i++) {
        ctx.strokeStyle = C.PRIMARY_COLOR; ctx.lineWidth = 4; ctx.beginPath();
        ctx.ellipse(C.GAME_WIDTH - 40 - i * 45, 30, C.EGG_WIDTH / 2.5, C.EGG_HEIGHT / 2.5, 0, 0, Math.PI * 2); ctx.stroke();
    }
    
    ctx.textAlign = 'center';
    if (comboActive.current) { drawDoodleText(ctx, 'COMBO x2!', C.GAME_WIDTH/2, 45, 40, C.GOLDEN_EGG_COLOR); }
    else if (scoreMultiplier.current > 1) { drawDoodleText(ctx, `ĐIỂM x${scoreMultiplier.current}!`, C.GAME_WIDTH/2, 45, 40, C.STAR_COLOR); }
    ctx.textAlign = 'left';

    // Hotbar
    const slotSize=50, gap=10, totalWidth = C.INVENTORY_SIZE * slotSize + (C.INVENTORY_SIZE-1) * gap;
    const startX = C.GAME_WIDTH/2 - totalWidth/2;
    inventory.current.forEach((itemType, i) => {
        const x = startX + i * (slotSize+gap);
        ctx.strokeStyle = C.PRIMARY_COLOR; ctx.lineWidth = 4;
        ctx.strokeRect(x, C.GAME_HEIGHT - slotSize - 10, slotSize, slotSize);
        drawDoodleText(ctx, `${i+1}`, x+5, C.GAME_HEIGHT-15, 18, C.PRIMARY_COLOR+'80');
        if(itemType) {
            const tempItem: Egg = { id:0, type: itemType, x: x+5, y: C.GAME_HEIGHT-slotSize-5, width: 40, height: 40, vx:0, vy:0 };
            if(itemType === EggType.MAGNET) { tempItem.width = 35; tempItem.height = 30; }
            drawFallingItem(ctx, tempItem);
        }
    });
  };

  const useInventoryItem = (slot: number) => {
    const itemType = inventory.current[slot];
    if (!itemType) return;
    inventory.current[slot] = null;
    
    switch(itemType) {
        case EggType.CLOCK: slowMoTimer.current = C.SLOW_MOTION_DURATION; sfx.current.playClockCatch(); break;
        case EggType.STAR: multiplierTimer.current = C.MULTIPLIER_DURATION; scoreMultiplier.current = C.SCORE_MULTIPLIER; sfx.current.playStarCatch(); break;
        case EggType.MAGNET: magnetTimer.current = C.MAGNET_DURATION; sfx.current.playMagnetCatch(); break;
    }
  };

  const spawnItem = useCallback(() => {
    const rand = Math.random();
    let type: EggType;
    if (rand < 0.02) type = EggType.HEART;
    else if (rand < 0.05) type = EggType.CLOCK;
    else if (rand < 0.08) type = EggType.STAR;
    else if (rand < 0.11) type = EggType.MAGNET;
    else if (rand < 0.18) type = EggType.BOMB;
    else if (rand < 0.28) type = EggType.GOLDEN;
    else if (rand < 0.45) type = EggType.ROTTEN;
    else type = EggType.NORMAL;
    
    let width, height;
    switch(type) {
        case EggType.BOMB: width=height=C.BOMB_RADIUS*2; break; case EggType.HEART: width=C.HEART_WIDTH; height=C.HEART_HEIGHT; break;
        case EggType.CLOCK: width=height=C.CLOCK_RADIUS*2; break; case EggType.STAR: width=C.STAR_WIDTH; height=C.STAR_HEIGHT; break;
        case EggType.MAGNET: width=C.MAGNET_WIDTH; height=C.MAGNET_HEIGHT; break;
        default: width=C.EGG_WIDTH; height=C.EGG_HEIGHT;
    }
    eggs.current.push({ id: Date.now()+Math.random(), type, x: Math.random()*(C.GAME_WIDTH-width), y: -height, width, height, vy:0, vx: (Math.random()-0.5)*60 });
  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    const dt = (currentTime - lastTime.current) / 1000;
    lastTime.current = currentTime;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const logicDt = slowMoTimer.current > 0 ? dt * C.SLOW_MOTION_FACTOR : dt;
    
    if (!isPaused) {
        // --- LOGIC ---
        // Player Movement
        if (inputState.current.touchX !== null) { playerX.current += (inputState.current.touchX - C.PLAYER_WIDTH / 2 - playerX.current) * 0.2; }
        else { if (inputState.current.left) playerX.current -= C.PLAYER_SPEED * dt; if (inputState.current.right) playerX.current += C.PLAYER_SPEED * dt; }
        playerX.current = Math.max(0, Math.min(C.GAME_WIDTH - C.PLAYER_WIDTH, playerX.current));

        // Difficulty & Spawning
        const difficultyLevel = Math.floor(score.current / C.DIFFICULTY_SCORE_INTERVAL);
        const currentSpawnRate = Math.max(0.3, C.INITIAL_SPAWN_RATE - difficultyLevel * C.SPAWN_RATE_DECREASE_PER_INTERVAL);
        spawnTimer.current += logicDt;
        if (spawnTimer.current > currentSpawnRate) { spawnTimer.current = 0; spawnItem(); }

        // Timers
        if (slowMoTimer.current > 0) slowMoTimer.current = Math.max(0, slowMoTimer.current - dt * 1000);
        if (magnetTimer.current > 0) magnetTimer.current = Math.max(0, magnetTimer.current - dt * 1000);
        if (multiplierTimer.current > 0) { multiplierTimer.current -= dt*1000; if (multiplierTimer.current <= 0) scoreMultiplier.current = 1; }
        if (comboActive.current) { comboTimer.current -= dt*1000; if (comboTimer.current <= 0) comboActive.current = false; }
        if (screenShake.current.duration > 0) { screenShake.current.duration -= dt*1000; } else { screenShake.current.magnitude = 0; }

        // Item Movement
        const eggBaseSpeed = C.INITIAL_EGG_SPEED + difficultyLevel * C.SPEED_INCREASE_PER_INTERVAL;
        const basketCenterX = playerX.current + C.PLAYER_WIDTH/2;
        eggs.current.forEach(egg => {
            egg.vy = eggBaseSpeed;
            if (magnetTimer.current > 0 && (egg.type === EggType.NORMAL || egg.type === EggType.GOLDEN || egg.type === EggType.HEART)) {
                const dx = basketCenterX - (egg.x + egg.width / 2);
                const dy = (C.GAME_HEIGHT - C.PLAYER_HEIGHT + C.BASKET_OFFSET_Y) - (egg.y + egg.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 10) {
                    egg.vx += (dx / dist) * C.MAGNET_ATTRACTION_FORCE * dt;
                    egg.vy += (dy / dist) * C.MAGNET_ATTRACTION_FORCE * dt;
                }
            }
            egg.y += egg.vy * logicDt;
            egg.x += egg.vx * logicDt;
            if (egg.x <= 0 || egg.x + egg.width >= C.GAME_WIDTH) { egg.vx *= -1; egg.x = Math.max(0, Math.min(C.GAME_WIDTH - egg.width, egg.x)); }
        });
        
        // Collisions
        const basket = { x: playerX.current + (C.PLAYER_WIDTH-C.BASKET_WIDTH)/2, y: C.GAME_HEIGHT-C.PLAYER_HEIGHT+C.BASKET_OFFSET_Y, width: C.BASKET_WIDTH, height: C.BASKET_HEIGHT };
        const caughtEggs = new Set<number>();
        eggs.current.forEach(egg => {
            if (egg.y + egg.height > basket.y && egg.y < basket.y + basket.height && egg.x + egg.width > basket.x && egg.x < basket.x + basket.width) {
                caughtEggs.add(egg.id);
                let pointsEarned = 0;
                switch(egg.type) {
                    case EggType.NORMAL: pointsEarned = C.SCORE_NORMAL; sfx.current.playCatch(); break;
                    case EggType.GOLDEN: pointsEarned = C.SCORE_GOLDEN; gameStats.current.goldenEggs++; sfx.current.playGoldenCatch(); break;
                    case EggType.ROTTEN: if (!user?.isAdmin) lives.current--; gameStats.current.rottenHit++; sfx.current.playRottenCatch(); screenShake.current = {magnitude: 8, duration: 200}; break;
                    case EggType.BOMB: if (!user?.isAdmin) lives.current--; gameStats.current.bombsHit++; sfx.current.playBomb(); screenShake.current = {magnitude: 20, duration: 500}; break;
                    case EggType.HEART: if (lives.current < 3 && !user?.isAdmin) lives.current++; sfx.current.playHeartCatch(); break;
                    case EggType.CLOCK: case EggType.STAR: case EggType.MAGNET:
                        const emptySlot = inventory.current.findIndex(i => i === null);
                        if (emptySlot !== -1) inventory.current[emptySlot] = egg.type;
                        if (egg.type === EggType.MAGNET) gameStats.current.magnetsCaught++;
                        else if (egg.type === EggType.STAR) gameStats.current.starsCaught++;
                        sfx.current.playCatch();
                        break;
                }
                if (pointsEarned > 0) {
                    comboCounter.current++; if (comboCounter.current >= C.COMBO_THRESHOLD) { comboActive.current = true; comboTimer.current = C.COMBO_DURATION; }
                    let finalPoints = pointsEarned * (comboActive.current ? 2 : 1) * scoreMultiplier.current;
                    score.current += finalPoints;
                } else if (egg.type === EggType.ROTTEN || egg.type === EggType.BOMB) { comboCounter.current = 0; comboActive.current = false; }
            }
        });
        
        const missedEggs = new Set<number>();
        eggs.current.forEach(egg => {
           if (egg.y > C.GAME_HEIGHT) {
               missedEggs.add(egg.id);
               if ((egg.type === EggType.NORMAL || egg.type === EggType.GOLDEN) && !user?.isAdmin) { lives.current--; comboCounter.current = 0; comboActive.current = false; sfx.current.playMiss(); }
           }
        });
        eggs.current = eggs.current.filter(e => !caughtEggs.has(e.id) && !missedEggs.has(e.id));
        
        if (lives.current <= 0) { onGameOver(score.current, gameStats.current); return; }
    }
    
    // --- DRAW ---
    ctx.save();
    if(screenShake.current.magnitude > 0) ctx.translate((Math.random()-0.5)*screenShake.current.magnitude, (Math.random()-0.5)*screenShake.current.magnitude);
    ctx.fillStyle = C.BACKGROUND_COLOR; ctx.fillRect(0, 0, C.GAME_WIDTH, C.GAME_HEIGHT);
    drawPlayer(ctx);
    eggs.current.forEach(egg => drawFallingItem(ctx, egg));
    drawUI(ctx);
    ctx.restore();
    
    requestAnimationFrame(gameLoop);
  }, [isPaused, onGameOver, spawnItem, user]);
  
  const handleResize = useCallback(() => { /* ... existing resize logic ... */ 
      const canvas = canvasRef.current; const container = gameContainerRef.current;
      if (canvas && container) {
          const { width, height } = container.getBoundingClientRect(); const scale = Math.min(width/C.GAME_WIDTH, height/C.GAME_HEIGHT);
          canvas.style.width = `${C.GAME_WIDTH*scale}px`; canvas.style.height = `${C.GAME_HEIGHT*scale}px`;
      }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if(canvas) { canvas.width = C.GAME_WIDTH; canvas.height = C.GAME_HEIGHT; }
    handleResize();
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'a' || e.key === 'ArrowLeft') inputState.current.left = true;
        if (e.key === 'd' || e.key === 'ArrowRight') inputState.current.right = true;
        if (e.key === 'p' || e.key === 'P') onPause();
        if (e.key >= '1' && e.key <= '3') useInventoryItem(parseInt(e.key) - 1);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'a' || e.key === 'ArrowLeft') inputState.current.left = false;
        if (e.key === 'd' || e.key === 'ArrowRight') inputState.current.right = false;
    };
    const getTouchX = (e: TouchEvent) => { const c = canvasRef.current; if(!c) return null; const r = c.getBoundingClientRect(); return (e.touches[0].clientX - r.left)/(r.width/C.GAME_WIDTH); }
    const handleTouchStart = (e: TouchEvent) => { inputState.current.touchX = getTouchX(e); };
    const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); inputState.current.touchX = getTouchX(e); };
    const handleTouchEnd = () => { inputState.current.touchX = null; };
    
    window.addEventListener('resize', handleResize); window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    const canvasEl = canvasRef.current;
    canvasEl?.addEventListener('touchstart', handleTouchStart); canvasEl?.addEventListener('touchmove', handleTouchMove, { passive: false }); canvasEl?.addEventListener('touchend', handleTouchEnd);
    requestAnimationFrame(gameLoop);
    
    return () => {
        window.removeEventListener('resize', handleResize); window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); 
        canvasEl?.removeEventListener('touchstart', handleTouchStart); canvasEl?.removeEventListener('touchmove', handleTouchMove); canvasEl?.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameLoop, handleResize, onPause]);
  
  return (
    <div ref={gameContainerRef} className="w-full h-full flex items-center justify-center cursor-none">
        <canvas ref={canvasRef} className="bg-white"></canvas>
    </div>
  );
};

export default GameScreen;
