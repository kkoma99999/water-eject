"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  WaterEjectorEngine,
  type FrequencyPreset,
  type StartOptions,
} from "@/lib/audio/engine";

export type EjectionStatus = "idle" | "playing" | "done";

export interface UseWaterEjectorResult {
  status: EjectionStatus;
  progress: number; // 0..1
  preset: FrequencyPreset;
  durationSeconds: number;
  setPreset: (p: FrequencyPreset) => void;
  setDurationSeconds: (s: number) => void;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
  error: string | null;
}

export function useWaterEjector(): UseWaterEjectorResult {
  const engineRef = useRef<WaterEjectorEngine | null>(null);
  const [status, setStatus] = useState<EjectionStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [preset, setPreset] = useState<FrequencyPreset>("165");
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const engine = new WaterEjectorEngine();
    engine.on("progress", (p) => setProgress(p));
    engine.on("done", () => {
      setStatus("done");
      setProgress(1);
    });
    engine.on("stopped", () => {
      setStatus("idle");
      setProgress(0);
    });
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const start = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;
    setError(null);
    setProgress(0);
    const opts: StartOptions = { preset, durationSeconds };
    try {
      await engine.start(opts);
      setStatus("playing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start audio.");
      setStatus("idle");
    }
  }, [preset, durationSeconds]);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    // Stop first so a reset() mid-play can't orphan a running oscillator.
    engineRef.current?.stop();
    setStatus("idle");
    setProgress(0);
  }, []);

  return {
    status,
    progress,
    preset,
    durationSeconds,
    setPreset,
    setDurationSeconds,
    start,
    stop,
    reset,
    error,
  };
}
