

class Sfx {
  private audioContext: AudioContext | null = null;

  private initializeAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private playSound({
    frequency = 440,
    endFrequency,
    duration,
    type = 'sine',
    volume = 0.3,
    attack = 0.01,
  }: {
    frequency?: number;
    endFrequency?: number;
    duration: number;
    type?: OscillatorType;
    volume?: number;
    attack?: number;
  }) {
    this.initializeAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + duration);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration * 0.9);
    }

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  private playNoise({
    duration,
    volume = 0.2,
    attack = 0.01,
    filterFrequency = 4000,
  }: {
    duration: number;
    volume?: number;
    attack?: number;
    filterFrequency?: number;
  }) {
    this.initializeAudioContext();
    if (!this.audioContext) return;
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFrequency;

    const gainNode = this.audioContext.createGain();

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + duration);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
  }

  playCatch() {
    this.playSound({ frequency: 800 + Math.random() * 100, duration: 0.1, type: 'sine', volume: 0.2 });
  }

  playGoldenCatch() {
    this.playSound({ frequency: 1000, duration: 0.1, type: 'triangle', volume: 0.3 });
    setTimeout(() => this.playSound({ frequency: 1500, duration: 0.15, type: 'triangle', volume: 0.3 }), 60);
  }

  playMiss() {
    this.playSound({ frequency: 250, endFrequency: 100, duration: 0.25, type: 'sawtooth', volume: 0.3 });
  }

  playBomb() {
    this.playSound({ frequency: 160, endFrequency: 40, duration: 0.5, type: 'square', volume: 0.4 });
    this.playNoise({ duration: 0.5, filterFrequency: 2000, volume: 0.3 });
  }
  
  playRottenCatch() {
    this.playSound({ frequency: 300, duration: 0.2, type: 'sawtooth', volume: 0.25 });
    this.playSound({ frequency: 325 + Math.random() * 20, duration: 0.2, type: 'sawtooth', volume: 0.25 });
  }
  
  playHeartCatch() {
    this.playSound({ frequency: 900, duration: 0.2, type: 'sine', volume: 0.3 });
    setTimeout(() => this.playSound({ frequency: 1200, duration: 0.2, type: 'sine', volume: 0.3 }), 80);
  }
  
  playClockCatch() {
    this.playSound({ frequency: 2000, duration: 0.08, type: 'triangle', volume: 0.25 });
    setTimeout(() => this.playSound({ frequency: 2000, duration: 0.08, type: 'triangle', volume: 0.25 }), 100);
  }

  playStarCatch() {
    this.playSound({ frequency: 1200, duration: 0.1, type: 'sine', volume: 0.3 });
    setTimeout(() => this.playSound({ frequency: 1600, duration: 0.1, type: 'sine', volume: 0.3 }), 80);
    setTimeout(() => this.playSound({ frequency: 2000, duration: 0.15, type: 'sine', volume: 0.3 }), 160);
  }
  
  playMagnetCatch() {
    this.playSound({ frequency: 400, endFrequency: 800, duration: 0.2, type: 'sawtooth', volume: 0.3 });
  }

  // FIX: Add missing playFrenzyCatch method.
  playFrenzyCatch() {
    this.playSound({ frequency: 1000, endFrequency: 2000, duration: 0.3, type: 'sawtooth', volume: 0.3 });
    this.playSound({ frequency: 1200, endFrequency: 2200, duration: 0.3, type: 'sawtooth', volume: 0.3 });
  }
}

export default Sfx;
