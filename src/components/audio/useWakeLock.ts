"use client";

import { useEffect, useRef } from "react";

// Minimal shape of the Wake Lock API, declared locally so the hook compiles
// regardless of the TS DOM lib's coverage and degrades cleanly where the
// browser lacks support (older iOS): the on-screen "keep the screen on" tip
// still covers those users.
interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
}
interface WakeLockApi {
  request: (type: "screen") => Promise<WakeLockSentinelLike>;
}

function getWakeLock(): WakeLockApi | null {
  return (navigator as unknown as { wakeLock?: WakeLockApi }).wakeLock ?? null;
}

/**
 * Holds a screen wake lock while `active` is true so the display — and with it
 * the AudioContext — doesn't sleep mid-playback. The browser releases the lock
 * automatically when the tab is hidden, so we re-acquire on visibilitychange.
 */
export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (!active) return;
    const wakeLock = getWakeLock();
    if (!wakeLock) return;

    let cancelled = false;

    const acquire = async () => {
      if (sentinelRef.current || document.visibilityState !== "visible") return;
      try {
        const sentinel = await wakeLock.request("screen");
        if (cancelled) {
          void sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        // The browser may drop the lock on its own (tab hidden); clear our ref
        // so onVisibilityChange knows to re-acquire.
        sentinel.addEventListener("release", () => {
          sentinelRef.current = null;
        });
      } catch {
        // Denied (e.g. low-power mode) — the manual tip covers it.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (sentinel && !sentinel.released) {
        void sentinel.release().catch(() => {});
      }
    };
  }, [active]);
}
