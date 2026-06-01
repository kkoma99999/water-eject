"use client";

import { useEffect, useRef } from "react";
import type { FrequencyPreset } from "@/lib/audio/engine";

interface WaveformProps {
  // Pulls the live AnalyserNode; null until the first play.
  getAnalyser: () => AnalyserNode | null;
  // True while a tone is playing — drives the live trace vs. the idle preview.
  active: boolean;
  preset: FrequencyPreset;
}

// Matches the theme tokens in globals.css (canvas can't read CSS variables).
const ACCENT = "#38bdf8";
const IDLE = "#334b66";
const CENTER_LINE = "rgba(148, 163, 184, 0.18)";

// Cap the redraw rate. The headline durations are 10/20 min and Loop, so an
// unthrottled 60fps trace (with a shadowBlur glow) is a real battery/thermal
// drain over a long session; ~30fps looks identical and halves the work.
const FRAME_MS = 1000 / 30;

function freqLabel(preset: FrequencyPreset): string {
  if (preset === "200") return "200 Hz";
  if (preset === "sweep") return "100–165 Hz";
  return "165 Hz";
}

// Roughly how many sine cycles to draw in the idle preview so each preset looks
// distinct. Not Hz-accurate (nothing is playing yet) — just a hint.
function idleCycles(preset: FrequencyPreset): number {
  if (preset === "200") return 8;
  if (preset === "sweep") return 6;
  return 7;
}

export function Waveform({ getAnalyser, active, preset }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

    const timeData = new Uint8Array(2048); // matches engine analyser fftSize
    let raf = 0;
    let phase = 0;
    let last = 0;

    // Render in CSS pixels but back the canvas with device pixels for sharpness.
    const sizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    const drawFrame = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const mid = h / 2;
      g.clearRect(0, 0, w, h);

      g.strokeStyle = CENTER_LINE;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, mid);
      g.lineTo(w, mid);
      g.stroke();

      const analyser = getAnalyser();

      if (active && analyser) {
        // Live oscilloscope: the real output passing through the analyser.
        analyser.getByteTimeDomainData(timeData);
        const amp = mid - 4;
        const step = w / timeData.length;
        g.strokeStyle = ACCENT;
        g.lineWidth = 2;
        // The glow is the most expensive part of the draw; skip it when the
        // user asked for reduced motion (and to lighten long sessions).
        if (!prefersReduced) {
          g.shadowColor = ACCENT;
          g.shadowBlur = 8;
        }
        g.beginPath();
        for (let i = 0; i < timeData.length; i++) {
          const v = (timeData[i] - 128) / 128; // -1..1
          const y = mid + v * amp;
          const x = i * step;
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
        g.shadowBlur = 0;
      } else {
        // Idle preview: a faint sine hinting at the preset. It drifts slowly
        // unless reduced motion is requested, in which case it's drawn static.
        const cycles = idleCycles(preset);
        const amp = (mid - 8) * 0.5;
        g.strokeStyle = IDLE;
        g.lineWidth = 2;
        g.beginPath();
        const pts = Math.max(2, Math.floor(w));
        for (let i = 0; i <= pts; i++) {
          const x = (i / pts) * w;
          const y = mid + Math.sin((i / pts) * cycles * Math.PI * 2 + phase) * amp;
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
    };

    // Reduced motion + idle: nothing moves, so render a single static frame and
    // never schedule the animation loop at all.
    if (prefersReduced && !active) {
      drawFrame();
      return () => {
        window.removeEventListener("resize", sizeCanvas);
      };
    }

    const loop = (t: number) => {
      if (t - last >= FRAME_MS) {
        last = t;
        // Advance the idle drift only when not playing. Step is sized for the
        // ~30fps cap so the apparent speed matches the old 60fps version.
        if (!active) phase += 0.04;
        drawFrame();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sizeCanvas);
    };
  }, [getAnalyser, active, preset]);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="h-24 w-full rounded-lg border border-white/10 bg-surface"
      />
      <div className="pointer-events-none absolute left-3 top-2 flex items-center gap-1.5 text-xs font-medium text-muted">
        {active && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
        <span>
          {freqLabel(preset)}
          {!active && " preview"}
        </span>
      </div>
    </div>
  );
}
