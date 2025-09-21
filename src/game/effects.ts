import { GameStateRef } from './state';

export const addFloatingText = (state: GameStateRef, text: string, x: number, y: number) => {
    state.floatingTexts.push({ id: Date.now() + Math.random(), text, x, y, vy: -50, opacity: 1, life: 1 });
};

export const triggerScreenShake = (state: GameStateRef, magnitude: number, duration: number) => {
    state.screenShake = { magnitude, duration };
};

export const createParticles = (state: GameStateRef, x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        state.particles.push({
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

export const updateEffects = (state: GameStateRef, dt: number) => {
    // Update particles
    state.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= dt; p.opacity = p.life; });
    state.particles = state.particles.filter(p => p.life > 0);

    // Update floating texts
    state.floatingTexts.forEach(t => { t.y += t.vy * dt; t.life -= dt; t.opacity = Math.max(0, t.life); });
    state.floatingTexts = state.floatingTexts.filter(t => t.life > 0);
    
    // Update screen shake
    if (state.screenShake.duration > 0) {
        state.screenShake.duration -= dt * 1000;
        if (state.screenShake.duration <= 0) {
            state.screenShake.magnitude = 0;
        }
    }
};
