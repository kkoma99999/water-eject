import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WaterEjectorEngine } from "@/lib/audio/engine";

// ---------------------------------------------------------------------------
// Minimal Web Audio API mock. The engine only touches a small surface area, so
// we record scheduled AudioParam events and node calls and assert against them.
// ---------------------------------------------------------------------------

interface ParamEvent {
  type: "setValueAtTime" | "linearRamp" | "cancel";
  value: number;
  time: number;
}

class FakeParam {
  value = 0;
  events: ParamEvent[] = [];
  setValueAtTime(value: number, time: number): this {
    this.events.push({ type: "setValueAtTime", value, time });
    this.value = value;
    return this;
  }
  linearRampToValueAtTime(value: number, time: number): this {
    this.events.push({ type: "linearRamp", value, time });
    this.value = value;
    return this;
  }
  cancelScheduledValues(time: number): this {
    this.events.push({ type: "cancel", value: 0, time });
    return this;
  }
}

class FakeOscillator {
  type = "";
  frequency = new FakeParam();
  onended: (() => void) | null = null;
  connectedTo: unknown = null;
  startCalls: number[] = [];
  stopCalls: number[] = [];
  connect(node: unknown): unknown {
    this.connectedTo = node;
    return node;
  }
  disconnect(): void {}
  start(t: number): void {
    this.startCalls.push(t);
  }
  stop(t: number): void {
    this.stopCalls.push(t);
  }
}

class FakeGain {
  gain = new FakeParam();
  connect(node: unknown): unknown {
    return node;
  }
  disconnect(): void {}
}

class FakeAnalyser {
  fftSize = 0;
  smoothingTimeConstant = 0;
  connect(): void {}
  disconnect(): void {}
  getByteTimeDomainData(): void {}
}

class FakeAudioContext {
  // iOS Safari starts every context suspended — mirror that so the resume path
  // is exercised on the first play.
  state: "suspended" | "running" | "closed" = "suspended";
  currentTime = 0;
  destination = {};
  onstatechange: (() => void) | null = null;
  createdOscillators: FakeOscillator[] = [];
  resumeCalls = 0;
  closeCalls = 0;

  constructor() {
    audioContexts.push(this);
  }
  createOscillator(): FakeOscillator {
    const o = new FakeOscillator();
    this.createdOscillators.push(o);
    return o;
  }
  createGain(): FakeGain {
    return new FakeGain();
  }
  createAnalyser(): FakeAnalyser {
    return new FakeAnalyser();
  }
  resume(): Promise<void> {
    this.resumeCalls += 1;
    this.state = "running";
    return Promise.resolve();
  }
  close(): Promise<void> {
    this.closeCalls += 1;
    this.state = "closed";
    return Promise.resolve();
  }
}

let audioContexts: FakeAudioContext[] = [];
const lastCtx = (): FakeAudioContext => audioContexts[audioContexts.length - 1];
const firstOsc = (): FakeOscillator => lastCtx().createdOscillators[0];
const gainOf = (osc: FakeOscillator): FakeGain => osc.connectedTo as FakeGain;

beforeEach(() => {
  audioContexts = [];
  vi.stubGlobal("window", { AudioContext: FakeAudioContext });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("WaterEjectorEngine", () => {
  it.each([
    ["165", 165],
    ["200", 200],
  ] as const)("preset %s plays a fixed %d Hz sine", async (preset, hz) => {
    const engine = new WaterEjectorEngine();
    await engine.start({ preset, durationSeconds: 600 });

    const osc = firstOsc();
    expect(osc.type).toBe("sine");
    expect(
      osc.frequency.events.some((e) => e.type === "setValueAtTime" && e.value === hz),
    ).toBe(true);
    // A fixed tone never ramps frequency.
    expect(osc.frequency.events.some((e) => e.type === "linearRamp")).toBe(false);
    expect(engine.isPlaying()).toBe(true);

    engine.dispose();
  });

  it("sweep preset ramps the frequency between 165 and 100 Hz", async () => {
    const engine = new WaterEjectorEngine();
    await engine.start({ preset: "sweep", durationSeconds: 12 });

    const osc = firstOsc();
    expect(osc.frequency.events[0]).toMatchObject({ type: "setValueAtTime", value: 165 });
    const ramps = osc.frequency.events.filter((e) => e.type === "linearRamp");
    expect(ramps.some((e) => e.value === 100)).toBe(true);
    expect(ramps.some((e) => e.value === 165)).toBe(true);

    engine.dispose();
  });

  it("ramps gain up at start and schedules a release ramp for finite playback", async () => {
    const engine = new WaterEjectorEngine();
    await engine.start({ preset: "165", durationSeconds: 600 });

    const osc = firstOsc();
    const gain = gainOf(osc);
    // Attack: 0 -> TARGET_GAIN.
    expect(gain.gain.events[0]).toMatchObject({ type: "setValueAtTime", value: 0 });
    expect(gain.gain.events.some((e) => e.type === "linearRamp" && e.value === 0.85)).toBe(true);
    // Release: ramp back to 0 near the scheduled end.
    expect(gain.gain.events.some((e) => e.type === "linearRamp" && e.value === 0 && e.time > 1)).toBe(
      true,
    );
    // The oscillator is scheduled to stop at the end of the finite window.
    expect(osc.stopCalls).toHaveLength(1);
    expect(osc.stopCalls[0]).toBeCloseTo(600, 5);

    engine.dispose();
  });

  it("loop mode does not schedule osc.stop or a gain release ramp", async () => {
    const engine = new WaterEjectorEngine();
    await engine.start({ preset: "165", durationSeconds: Infinity });

    const osc = firstOsc();
    const gain = gainOf(osc);
    expect(osc.stopCalls).toHaveLength(0);
    expect(gain.gain.events.filter((e) => e.type === "linearRamp" && e.value === 0)).toHaveLength(0);
    // Still ramps up to full gain.
    expect(gain.gain.events.some((e) => e.type === "linearRamp" && e.value === 0.85)).toBe(true);

    engine.dispose();
  });

  it("loop-mode sweep keeps scheduling ahead without ever stopping the oscillator", async () => {
    vi.useFakeTimers();
    const engine = new WaterEjectorEngine();
    await engine.start({ preset: "sweep", durationSeconds: Infinity });

    const ctx = lastCtx();
    const osc = ctx.createdOscillators[0];
    expect(osc.stopCalls).toHaveLength(0);

    const before = osc.frequency.events.length;
    // Advance the audio clock and fire the 10s refill interval.
    ctx.currentTime += 30;
    vi.advanceTimersByTime(10_000);
    expect(osc.frequency.events.length).toBeGreaterThan(before);

    engine.dispose();
  });

  it("resumes a suspended (iOS) context before playing", async () => {
    const engine = new WaterEjectorEngine();
    await engine.start({ preset: "165", durationSeconds: 600 });

    const ctx = lastCtx();
    expect(ctx.resumeCalls).toBeGreaterThanOrEqual(1);
    expect(ctx.state).toBe("running");

    engine.dispose();
  });

  it("reports progress and fires done on a natural end (finite)", async () => {
    vi.useFakeTimers();
    const engine = new WaterEjectorEngine();
    const progress = vi.fn();
    const done = vi.fn();
    engine.on("progress", progress);
    engine.on("done", done);

    await engine.start({ preset: "165", durationSeconds: 600 });
    const osc = firstOsc();

    // The 250ms progress interval ticks at least once.
    vi.advanceTimersByTime(250);
    expect(progress).toHaveBeenCalled();

    // Simulate the scheduled oscillator end.
    osc.onended?.();
    expect(progress).toHaveBeenLastCalledWith(1);
    expect(done).toHaveBeenCalledTimes(1);
    expect(engine.isPlaying()).toBe(false);

    engine.dispose();
  });

  it("stop() emits 'stopped', detaches onended, and prevents the done path", async () => {
    const engine = new WaterEjectorEngine();
    const stopped = vi.fn();
    const done = vi.fn();
    engine.on("stopped", stopped);
    engine.on("done", done);

    await engine.start({ preset: "200", durationSeconds: 600 });
    const osc = firstOsc();
    engine.stop();

    expect(stopped).toHaveBeenCalledTimes(1);
    expect(engine.isPlaying()).toBe(false);
    // Detached so a late natural-end can't fire 'done' after a manual stop.
    expect(osc.onended).toBeNull();
    expect(done).not.toHaveBeenCalled();
    // A fade-out ramp to 0 is scheduled to avoid a click.
    expect(gainOf(osc).gain.events.some((e) => e.type === "linearRamp" && e.value === 0)).toBe(true);

    engine.dispose();
  });

  it("starting again while playing replaces the previous oscillator", async () => {
    const engine = new WaterEjectorEngine();
    await engine.start({ preset: "165", durationSeconds: 600 });
    await engine.start({ preset: "200", durationSeconds: 600 });

    const ctx = lastCtx();
    // Same context reused across plays; two oscillators created.
    expect(audioContexts).toHaveLength(1);
    expect(ctx.createdOscillators).toHaveLength(2);
    // The first oscillator was stopped and detached.
    expect(ctx.createdOscillators[0].onended).toBeNull();
    expect(engine.isPlaying()).toBe(true);

    engine.dispose();
  });

  it("exposes the analyser only after the first play and closes the context on dispose", async () => {
    const engine = new WaterEjectorEngine();
    expect(engine.getAnalyser()).toBeNull();

    await engine.start({ preset: "165", durationSeconds: 600 });
    expect(engine.getAnalyser()).not.toBeNull();

    const ctx = lastCtx();
    engine.dispose();
    expect(ctx.closeCalls).toBeGreaterThanOrEqual(1);
    expect(engine.getAnalyser()).toBeNull();
  });
});
