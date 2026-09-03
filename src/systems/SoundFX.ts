/**
 * Sound Effects Engine with Web Audio Procedural Synthesizer & Asset Audio Fallback
 */

export class SoundFX {
  private static instance: SoundFX;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmNormalVolume: number = 0.35;
  private bgmCurrentVolume: number = 0.35;
  private fadeInterval: number | null = null;

  private constructor() {
    try {
      this.isMusicMuted = localStorage.getItem('canvassing_sa_music_muted') === 'true';
      this.isMuted = localStorage.getItem('canvassing_sa_sfx_muted') === 'true';
    } catch {
      // Storage unavailable
    }

    // Initialize Web Audio & unlock HTML5 Audio on first user gesture
    const initAudio = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.bgmAudio && this.isBgmPlaying && !this.isMusicMuted && this.bgmAudio.paused) {
        this.bgmAudio.play().catch(() => {});
      }
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };

    window.addEventListener('click', initAudio, { once: false });
    window.addEventListener('keydown', initAudio, { once: false });
    window.addEventListener('touchstart', initAudio, { once: false });

    // Handle tab visibility (pause when backgrounded, resume when active)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.bgmAudio && !this.bgmAudio.paused) {
          this.bgmAudio.pause();
        }
      } else {
        if (this.bgmAudio && this.isBgmPlaying && !this.isMusicMuted) {
          this.bgmAudio.play().catch(() => {});
        }
      }
    });
  }

  public static getInstance(): SoundFX {
    if (!SoundFX.instance) {
      SoundFX.instance = new SoundFX();
    }
    return SoundFX.instance;
  }

  // --- Background Music (BGM) Management ---

  private initBGM() {
    if (this.bgmAudio) return;
    try {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      this.bgmAudio.preload = 'auto';

      const mp3Path = 'assets/audio/game_jingle.mp3';
      const wavPath = 'assets/audio/game_jingle.wav';

      // Fallback seamlessly to WAV if MP3 is missing
      this.bgmAudio.src = mp3Path;
      this.bgmAudio.onerror = () => {
        if (this.bgmAudio && !this.bgmAudio.src.endsWith(wavPath)) {
          this.bgmAudio.src = wavPath;
          if (this.isBgmPlaying && !this.isMusicMuted) {
            this.bgmAudio.play().catch(() => {});
          }
        }
      };

      this.bgmAudio.volume = this.isMusicMuted ? 0 : this.bgmCurrentVolume;
    } catch {
      // Audio element not supported
    }
  }

  public playBGM() {
    this.isBgmPlaying = true;
    this.initBGM();
    if (!this.bgmAudio) return;

    if (this.isMusicMuted) {
      this.bgmAudio.volume = 0;
      return;
    }

    this.fadeToVolume(this.bgmNormalVolume, 400);
    this.bgmAudio.play().catch(() => {
      // Will auto-play on next interaction
    });
  }

  public stopBGM(fadeOut: boolean = false) {
    this.isBgmPlaying = false;
    if (!this.bgmAudio) return;

    if (fadeOut) {
      this.fadeToVolume(0, 500, () => {
        if (this.bgmAudio && !this.isBgmPlaying) {
          this.bgmAudio.pause();
        }
      });
    } else {
      this.clearFade();
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }

  public duckBGM(duckVolume: number = 0.10) {
    if (!this.isBgmPlaying || this.isMusicMuted) return;
    this.fadeToVolume(duckVolume, 220);
  }

  public unduckBGM() {
    if (!this.isBgmPlaying || this.isMusicMuted) return;
    this.fadeToVolume(this.bgmNormalVolume, 300);
  }

  public toggleMusicMute(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    try {
      localStorage.setItem('canvassing_sa_music_muted', String(this.isMusicMuted));
    } catch {}

    if (this.bgmAudio) {
      if (this.isMusicMuted) {
        this.clearFade();
        this.bgmAudio.volume = 0;
      } else {
        this.bgmAudio.volume = this.bgmCurrentVolume;
        if (this.isBgmPlaying) {
          this.bgmAudio.play().catch(() => {});
        }
      }
    }
    return this.isMusicMuted;
  }

  public isMusicMutedState(): boolean {
    return this.isMusicMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('canvassing_sa_sfx_muted', String(this.isMuted));
    } catch {}
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private clearFade() {
    if (this.fadeInterval !== null) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  private fadeToVolume(targetVol: number, durationMs: number, onComplete?: () => void) {
    this.clearFade();
    if (!this.bgmAudio) return;

    if (this.isMusicMuted) {
      this.bgmAudio.volume = 0;
      if (onComplete) onComplete();
      return;
    }

    const startVol = this.bgmAudio.volume;
    const diff = targetVol - startVol;
    if (Math.abs(diff) < 0.01) {
      this.bgmAudio.volume = targetVol;
      this.bgmCurrentVolume = targetVol;
      if (onComplete) onComplete();
      return;
    }

    const steps = 12;
    const stepInterval = durationMs / steps;
    let step = 0;

    this.fadeInterval = window.setInterval(() => {
      step++;
      const current = startVol + (diff * (step / steps));
      if (this.bgmAudio) {
        this.bgmAudio.volume = Math.max(0, Math.min(1, current));
      }
      this.bgmCurrentVolume = current;

      if (step >= steps) {
        this.clearFade();
        if (this.bgmAudio) {
          this.bgmAudio.volume = targetVol;
        }
        this.bgmCurrentVolume = targetVol;
        if (onComplete) onComplete();
      }
    }, stepInterval);
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playFootstep() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context silenced or blocked
    }
  }

  public playJump() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // Audio context
    }
  }

  public playHit() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      // Thud + Noise
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio
    }
  }

  public playResidentAlert() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.setValueAtTime(780, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio
    }
  }

  public playVotePositive() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const notes = [440, 554, 659, 880]; // A major chord arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.2);
      });
    } catch {
      // Audio
    }
  }

  public playVoteDoubtful() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(310, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio
    }
  }

  public playVoteNegative() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio
    }
  }

  public playButtonClick() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio
    }
  }

  public playTaxiHorn() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      [0, 0.12].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(460, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.08);
      });
    } catch {
      // Audio
    }
  }

  public playStreetVictory() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C high fanfare
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
      });
    } catch {
      // Audio
    }
  }

  public playObstacleFixed() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      // Upbeat bright chime (D5 to A5 sparkle)
      const notes = [587.33, 880.0];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.22);
      });
    } catch {
      // Audio
    }
  }
}
