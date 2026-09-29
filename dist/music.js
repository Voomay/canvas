// Original synthesized arcade score with lookahead scheduler and dynamics compression.
// Audio starts only from a user gesture and maintains rock-solid timing on mobile.
export class GameMusic {
  constructor() {
    this.enabled = false;
    this.playing = false;
    this.step = 0;
    this.next = 0;
    this.ward = 50;
    this.lastSuck = 0;
    this.lastPop = 0;
  }

  initAudio() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Audio init error:', e);
    }
  }

  async enable(value) {
    this.enabled = value;
    try {
      if (value) {
        this.initAudio();
        if (this.ctx && this.ctx.state !== 'running') {
          await this.ctx.resume();
        }
        if (this.ctx) {
          this.next = this.ctx.currentTime + 0.05;
        }
      } else if (this.ctx) {
        await this.ctx.suspend();
      }
    } catch (_) {
      this.enabled = false;
    }
    return this.enabled;
  }

  note(freq, time, duration = 0.16, volume = 0.09, type = 'sine', end = freq) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const startTime = Math.max(now, time);
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, startTime);
      if (end !== freq) {
        o.frequency.exponentialRampToValueAtTime(Math.max(20, end), startTime + duration);
      }
      g.gain.setValueAtTime(0.0001, startTime);
      g.gain.exponentialRampToValueAtTime(Math.min(0.8, volume * 2.0), startTime + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      o.connect(g);
      const target = this.compressor || this.ctx.destination;
      g.connect(target);

      o.start(startTime);
      o.stop(startTime + duration + 0.02);
      o.onended = () => {
        try {
          o.disconnect();
          g.disconnect();
        } catch (_) {}
      };
    } catch (_) {}
  }

  cue(kind) {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    if (kind === 'suck') {
      if (now - this.lastSuck < 0.065) return;
      this.lastSuck = now;
      this.note(420, now, 0.25, 0.14, 'triangle', 75);
      this.note(170, now + 0.11, 0.14, 0.09, 'sine', 45);
      return;
    }
    if (kind === 'pop') {
      if (now - this.lastPop < 0.07) return;
      this.lastPop = now;
      const seq = [523.25, 659.25, 783.99, 1046.5];
      seq.forEach((f, i) => this.note(f, now + i * 0.075, 0.14, 0.12, 'sine'));
      return;
    }
    const seq = kind === 'win'
      ? [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5]
      : kind === 'lose'
      ? [392, 329.63, 261.63]
      : [392, 523.25, 659.25];
    seq.forEach((f, i) => this.note(f, now + i * 0.09, kind === 'win' ? 0.30 : 0.16, 0.14, 'sine'));
  }

  tick(playing, ward) {
    this.ward = ward;
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    if (!playing) {
      this.playing = false;
      this.next = now + 0.1;
      return;
    }
    if (!this.playing) {
      this.playing = true;
      this.next = now + 0.04;
      this.step = 0;
    }
    // If underrun occurs (e.g. background tab or garbage collection pause > 250ms), resync
    if (this.next < now - 0.25) {
      this.next = now + 0.03;
    }
    const beat = ward === 54 ? 0.145 : 0.135;
    const melody = ward === 54
      ? [76, 0, 79, 0, 83, 81, 79, 0, 76, 0, 74, 76, 79, 0, 74, 0]
      : [72, 0, 76, 79, 0, 76, 74, 0, 72, 0, 67, 0, 74, 76, 79, 0];

    // Lookahead schedule up to 220ms into the Web Audio clock to guarantee stutter-free playback
    let count = 0;
    while (this.next < now + 0.22 && count < 8) {
      count++;
      const i = this.step % 32;
      const n = melody[i % 16];
      const t = Math.max(now, this.next);
      const root = [48, 45, 53, 55][Math.floor(i / 8)];
      if (n) this.note(440 * 2 ** ((n - 69) / 12), t, 0.11, 0.062, 'sine');
      if (i % 4 === 0) {
        this.note(440 * 2 ** ((root - 69) / 12), t, 0.20, 0.10, 'triangle');
        this.note(95, t, 0.08, 0.085, 'sine', 35);
      }
      if (i % 2 === 1) this.note(1800, t, 0.022, 0.018, 'triangle', 900);
      this.next += beat;
      this.step++;
    }
  }
}
