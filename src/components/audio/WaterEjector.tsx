"use client";

import { useRef, type KeyboardEvent } from "react";
import { useWaterEjector } from "./useWaterEjector";
import type { FrequencyPreset } from "@/lib/audio/engine";
import { Square } from "lucide-react";
import clsx from "clsx";

const FREQUENCY_OPTIONS: { value: FrequencyPreset; label: string; hint: string }[] = [
  { value: "165", label: "165 Hz", hint: "Apple-style" },
  { value: "200", label: "200 Hz", hint: "Stronger" },
  { value: "sweep", label: "Sweep", hint: "165 ↔ 100" },
];

const DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
  { value: Infinity, label: "Loop ∞" },
];

export function WaterEjector() {
  const ej = useWaterEjector();
  const isPlaying = ej.status === "playing";
  const isDone = ej.status === "done";
  const isInfinite = !Number.isFinite(ej.durationSeconds);
  const showSpinner = isInfinite && isPlaying;

  // Roving-tabindex + arrow-key navigation for the two ARIA radiogroups below,
  // per the WAI-ARIA radio group pattern (Tab enters the group once; arrows,
  // Home and End move and select within it).
  const freqRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const durRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const moveRadio = <T,>(
    e: KeyboardEvent<HTMLButtonElement>,
    index: number,
    values: T[],
    select: (v: T) => void,
    refs: (HTMLButtonElement | null)[],
  ) => {
    let next = index;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (index + 1) % values.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (index - 1 + values.length) % values.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = values.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    select(values[next]);
    refs[next]?.focus();
  };

  const onPrimaryPress = () => {
    if (isPlaying) {
      ej.stop();
    } else {
      // From idle OR done: start() resets progress and clears errors, so a
      // single tap replays instead of the old reset-then-tap-again flow.
      void ej.start();
    }
  };

  // Progress ring geometry.
  const size = 240;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ej.progress);

  return (
    <section
      className="mx-auto flex w-full max-w-md flex-col items-center gap-8 px-4 py-8"
      aria-labelledby="tool-title"
    >
      <header className="text-center">
        <h1
          id="tool-title"
          className="text-balance text-3xl font-semibold tracking-tight text-text sm:text-4xl"
        >
          Get Water Out of Your Phone Speaker <span aria-hidden="true">💦</span>
        </h1>
        <p className="mt-3 text-pretty text-base text-muted">
          Tap the button. A tone vibrates the water out — the same trick Apple Watch uses for
          Water Lock. No app, no rice 🍚.
        </p>
      </header>

      <fieldset
        className="w-full"
        disabled={isPlaying}
        aria-label="Frequency preset"
      >
        <legend className="mb-2 text-sm font-medium text-muted">Frequency</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {FREQUENCY_OPTIONS.map((opt, i) => {
            const active = ej.preset === opt.value;
            return (
              <button
                key={opt.value}
                ref={(el) => {
                  freqRefs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => ej.setPreset(opt.value)}
                onKeyDown={(e) =>
                  moveRadio(
                    e,
                    i,
                    FREQUENCY_OPTIONS.map((o) => o.value),
                    ej.setPreset,
                    freqRefs.current,
                  )
                }
                className={clsx(
                  "flex min-h-12 flex-col items-center justify-center rounded-lg border px-3 py-2 text-sm transition",
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-white/10 bg-surface text-text hover:border-white/20",
                  isPlaying && "opacity-60",
                )}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-xs text-muted">{opt.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset
        className="w-full"
        disabled={isPlaying}
        aria-label="Duration"
      >
        <legend className="mb-2 text-sm font-medium text-muted">Duration</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {DURATION_OPTIONS.map((opt, i) => {
            const active = ej.durationSeconds === opt.value;
            return (
              <button
                key={opt.value}
                ref={(el) => {
                  durRefs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => ej.setDurationSeconds(opt.value)}
                onKeyDown={(e) =>
                  moveRadio(
                    e,
                    i,
                    DURATION_OPTIONS.map((o) => o.value),
                    ej.setDurationSeconds,
                    durRefs.current,
                  )
                }
                className={clsx(
                  "flex min-h-12 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition",
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-white/10 bg-surface text-text hover:border-white/20",
                  isPlaying && "opacity-60",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className={clsx(
            "absolute inset-0",
            showSpinner ? "animate-[spin_2.4s_linear_infinite]" : "-rotate-90",
          )}
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-white/5"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={showSpinner ? `${circumference * 0.3} ${circumference}` : circumference}
            strokeDashoffset={showSpinner ? 0 : dashOffset}
            className={clsx(
              "text-accent",
              !showSpinner && "transition-[stroke-dashoffset] duration-200 ease-linear",
            )}
          />
        </svg>

        <button
          type="button"
          onClick={onPrimaryPress}
          aria-pressed={isPlaying}
          className={clsx(
            "relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full text-text shadow-lg transition",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50",
            isPlaying
              ? "bg-accent text-bg"
              : isDone
                ? "bg-emerald-500 text-bg"
                : "bg-accent-strong text-bg hover:scale-105 active:scale-95",
          )}
        >
          {isPlaying ? (
            <>
              <Square className="h-9 w-9" fill="currentColor" />
              <span className="mt-1 text-sm font-semibold">Stop</span>
            </>
          ) : isDone ? (
            <>
              <span className="text-4xl leading-none" aria-hidden="true">✅</span>
              <span className="mt-2 text-sm font-semibold">Done</span>
            </>
          ) : (
            <>
              <span className="text-4xl leading-none" aria-hidden="true">💨💦</span>
              <span className="mt-2 text-sm font-semibold">Tap to play</span>
            </>
          )}
        </button>

        {isPlaying && (
          <span
            aria-hidden="true"
            className="absolute inset-0 m-auto h-32 w-32 animate-ping rounded-full bg-accent/30"
          />
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {isPlaying
          ? isInfinite
            ? "Playing tone in loop mode. Press stop to end."
            : `Playing tone. ${Math.round(ej.progress * 100)} percent complete.`
          : isDone
            ? "Water ejection complete. Tap to run again."
            : "Idle. Press start to begin."}
      </p>

      {isDone && (
        <button
          type="button"
          onClick={() => void ej.start()}
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Run again
        </button>
      )}

      {ej.error && (
        <p className="text-sm text-red-400" role="alert">
          {ej.error}
        </p>
      )}

      <ul className="grid w-full gap-3 text-sm text-muted sm:grid-cols-3">
        <li className="flex items-start gap-2 rounded-lg bg-surface p-3">
          <span className="text-base leading-none" aria-hidden="true">🔊</span>
          <span>Crank your volume to max before starting.</span>
        </li>
        <li className="flex items-start gap-2 rounded-lg bg-surface p-3">
          <span className="text-base leading-none" aria-hidden="true">📱</span>
          <span>Hold the phone with the speaker pointing down.</span>
        </li>
        <li className="flex items-start gap-2 rounded-lg bg-surface p-3">
          <span className="text-base leading-none" aria-hidden="true">☀️</span>
          <span>Keep the screen on so audio doesn&apos;t pause.</span>
        </li>
      </ul>
    </section>
  );
}
