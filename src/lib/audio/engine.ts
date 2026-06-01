// Framework-agnostic Web Audio engine that plays a low-frequency tone
// to vibrate water out of a phone speaker.
//
// Why this shape:
// - AudioContext is constructed lazily on the first user gesture. Constructing
//   it at module scope breaks SSR and burns a context on iOS Safari, which
//   starts every AudioContext in the `suspended` state and requires
//   `resume()` from inside a user gesture.
// - We keep one AudioContext alive across plays. Creating a new one per play
//   is expensive on iOS and audibly delays the first tone.
// - Gain ramps at start/stop prevent the audible click that comes from
//   instantly switching a sine wave on or off.
// - A persistent AnalyserNode sits between the gain and the destination so the
//   UI can draw a live waveform of exactly what is playing.

export type FrequencyPreset = "165" | "200" | "sweep";

export interface StartOptions {
  preset: FrequencyPreset;
  // Use Infinity for loop-forever mode.
  durationSeconds: number;
}

export interface EngineEvents {
  progress: (progress: number) => void; // 0..1
  done: () => void;
  stopped: () => void;
}

const TARGET_GAIN = 0.85;
const RAMP_SECONDS = 0.05;

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function createAudioContext(): AudioContext {
  const w = window as WindowWithWebkitAudio;
  const Ctor = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) {
    throw new Error("Web Audio API is not supported in this browser.");
  }
  return new Ctor();
}

export class WaterEjectorEngine {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  // Persistent tap for the waveform UI. Created with the context, kept wired to
  // the destination across plays. Null until the first play.
  private analyser: AnalyserNode | null = null;
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private sweepTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Partial<EngineEvents> = {};
  private startedAt = 0;
  private durationMs = 0;

  on<K extends keyof EngineEvents>(event: K, cb: EngineEvents[K]): void {
    this.listeners[event] = cb;
  }

  isPlaying(): boolean {
    return this.oscillator !== null;
  }

  // The visualization reads time-domain data from this. Null until the first
  // play has created the AudioContext.
  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  // Must be called from inside a user gesture (click/tap) for iOS Safari.
  async start({ preset, durationSeconds }: StartOptions): Promise<void> {
    if (this.isPlaying()) {
      this.stop();
    }
    if (!this.ctx) {
      this.ctx = createAudioContext();
      // Persistent analyser → destination. fftSize 2048 is ~43ms at 48kHz,
      // enough to show several full cycles of a 100–200 Hz tone. No smoothing
      // so the trace tracks the signal frame-accurately.
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0;
      this.analyser.connect(this.ctx.destination);
      // Recover from OS-level interruptions (iOS phone call / Siri / audio route
      // change), which drop the context out of "running" mid-play. Attempt to
      // resume so the tone continues once the interruption clears, on browsers
      // that permit a non-gesture resume. (Full UI surfacing of an
      // unrecoverable interruption is a follow-up.)
      this.ctx.onstatechange = () => {
        const ctx = this.ctx;
        if (ctx && this.oscillator && ctx.state !== "running" && ctx.state !== "closed") {
          void ctx.resume().catch(() => {
            // Couldn't auto-recover (iOS needs a fresh user gesture): stop
            // cleanly so the UI returns to idle instead of a silent "playing".
            this.stop();
          });
        }
      };
    }
    // iOS Safari can leave the context "suspended" or — after a phone call or
    // Siri — "interrupted"; both need resume() from inside a user gesture.
    // "interrupted" isn't in the TS lib types, so test against "running".
    if (this.ctx.state !== "running") {
      await this.ctx.resume();
    }
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const isInfinite = !Number.isFinite(durationSeconds);

    const osc = ctx.createOscillator();
    osc.type = "sine";

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(TARGET_GAIN, now + RAMP_SECONDS);
    if (!isInfinite) {
      gain.gain.setValueAtTime(TARGET_GAIN, now + durationSeconds - RAMP_SECONDS);
      gain.gain.linearRampToValueAtTime(0, now + durationSeconds);
    }

    this.scheduleFrequency(osc, preset, now, durationSeconds, isInfinite);

    // Route through the analyser so the waveform reflects the real output.
    osc.connect(gain).connect(this.analyser ?? ctx.destination);
    osc.start(now);
    if (!isInfinite) {
      osc.stop(now + durationSeconds);
    }

    this.oscillator = osc;
    this.gain = gain;
    this.startedAt = performance.now();
    this.durationMs = durationSeconds * 1000;

    osc.onended = () => {
      // Distinguish a natural end from a user-initiated stop: if the
      // oscillator ref is still ours, this was the scheduled end.
      if (this.oscillator === osc) {
        this.cleanup();
        this.listeners.progress?.(1);
        this.listeners.done?.();
      }
    };

    if (!isInfinite) {
      this.progressTimer = setInterval(() => {
        const elapsed = performance.now() - this.startedAt;
        const progress = Math.min(1, elapsed / this.durationMs);
        this.listeners.progress?.(progress);
      }, 250);
    }
  }

  stop(): void {
    if (!this.oscillator || !this.gain || !this.ctx) {
      return;
    }
    const osc = this.oscillator;
    const gain = this.gain;
    const ctx = this.ctx;
    // Detach so onended doesn't fire the "done" path.
    this.oscillator = null;
    this.gain = null;
    osc.onended = null;

    const now = ctx.currentTime;
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + RAMP_SECONDS);
      osc.stop(now + RAMP_SECONDS + 0.01);
    } catch {
      // Oscillator may already be stopped; ignore.
    }
    setTimeout(() => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // ignore
      }
    }, (RAMP_SECONDS + 0.05) * 1000);

    this.clearTimers();
    this.listeners.stopped?.();
  }

  dispose(): void {
    this.stop();
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close().catch(() => {});
    }
    this.ctx = null;
    this.analyser = null;
    this.listeners = {};
  }

  private scheduleFrequency(
    osc: OscillatorNode,
    preset: FrequencyPreset,
    startTime: number,
    durationSeconds: number,
    isInfinite: boolean,
  ): void {
    if (preset === "165") {
      osc.frequency.setValueAtTime(165, startTime);
      return;
    }
    if (preset === "200") {
      osc.frequency.setValueAtTime(200, startTime);
      return;
    }
    // Sweep: 165 -> 100 -> 165, repeated. Each cycle is ~6s.
    const cycle = 6;
    osc.frequency.setValueAtTime(165, startTime);

    if (!isInfinite) {
      let t = startTime;
      while (t < startTime + durationSeconds) {
        osc.frequency.linearRampToValueAtTime(100, t + cycle / 2);
        osc.frequency.linearRampToValueAtTime(165, t + cycle);
        t += cycle;
      }
      return;
    }

    // For loop-forever, roll-schedule a 30s horizon and refill every 10s.
    // This keeps the event queue bounded instead of enqueueing forever.
    const horizon = 30;
    let scheduledUntil = startTime;
    const scheduleAhead = () => {
      if (!this.ctx || this.oscillator !== osc) return;
      const target = this.ctx.currentTime + horizon;
      while (scheduledUntil < target) {
        osc.frequency.linearRampToValueAtTime(100, scheduledUntil + cycle / 2);
        osc.frequency.linearRampToValueAtTime(165, scheduledUntil + cycle);
        scheduledUntil += cycle;
      }
    };
    scheduleAhead();
    this.sweepTimer = setInterval(scheduleAhead, 10_000);
  }

  private cleanup(): void {
    this.oscillator = null;
    this.gain = null;
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
  }
}
