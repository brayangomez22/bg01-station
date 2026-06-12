/**
 * Diegetic audio engine — pure WebAudio, no assets, no dependencies.
 * Everything is synthesized: a low station hum plus short UI acknowledgments.
 * The engine only exists after the user enables sound (a user gesture, which
 * also satisfies autoplay policies).
 */

export type SoundName = 'blip' | 'select' | 'static' | 'confirm' | 'dock';

const HUM_LEVEL = 0.012;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private humGain: GainNode | null = null;
  private humOscs: OscillatorNode[] = [];
  private noiseBuffer: AudioBuffer | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** Start the ambient hum: two detuned low oscillators through a lowpass. */
  enable(): void {
    const ctx = this.ensureContext();
    if (!ctx || this.humOscs.length > 0) return;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(HUM_LEVEL, ctx.currentTime + 2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 160;

    for (const freq of [54, 108.5]) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start();
      this.humOscs.push(osc);
    }
    filter.connect(gain).connect(ctx.destination);
    this.humGain = gain;
  }

  /** Fade the hum out and release the oscillators. */
  disable(): void {
    const ctx = this.ctx;
    if (!ctx || !this.humGain) return;
    const gain = this.humGain;
    const oscs = this.humOscs;
    this.humGain = null;
    this.humOscs = [];
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    setTimeout(() => {
      oscs.forEach((o) => o.stop());
      gain.disconnect();
    }, 700);
  }

  play(name: SoundName): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    switch (name) {
      case 'blip':
        this.tone(ctx, 880, 0.025, 0.03);
        break;
      case 'select':
        this.tone(ctx, 1320, 0.03, 0.035);
        break;
      case 'confirm':
        this.tone(ctx, 660, 0.05, 0.06);
        this.tone(ctx, 880, 0.05, 0.06, 0.09);
        break;
      case 'dock':
        // Low arrival chord: root + fifth, slow release.
        this.tone(ctx, 110, 0.05, 1.0);
        this.tone(ctx, 165, 0.035, 1.0, 0.05);
        break;
      case 'static':
        this.burst(ctx, 0.3);
        break;
    }
  }

  /** Short sine with exponential decay. */
  private tone(
    ctx: AudioContext,
    freq: number,
    level: number,
    decay: number,
    delay = 0,
  ): void {
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(level, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + decay + 0.05);
  }

  /** Filtered noise burst — the transmission static. */
  private burst(ctx: AudioContext, duration: number): void {
    if (!this.noiseBuffer) {
      const length = Math.ceil(ctx.sampleRate * 0.5);
      this.noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    const t0 = ctx.currentTime;
    gain.gain.setValueAtTime(0.035, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + duration + 0.05);
  }
}

export const audioEngine = new AudioEngine();
