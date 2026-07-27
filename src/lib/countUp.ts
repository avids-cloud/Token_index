// Count-up animation hook for dollar figures.
// Briefly animates numbers when they change, like a currency board updating.
// Respects prefers-reduced-motion by swapping the count-up for an instant
// update. See docs/DESIGN.md "Signature element".

import { useEffect, useRef, useState } from 'react';

const ANIMATION_MS = 400; // brief, per DESIGN.md

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function useCountUp(
  target: number,
  options?: { decimals?: number; enabled?: boolean },
): string {
  const decimals = options?.decimals ?? 4;
  const { enabled = true } = options ?? {};

  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    // Respect reduced-motion: if the user prefers reduced motion or the
    // animation is disabled, skip the count-up and show the value instantly.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!enabled || prefersReduced) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }

    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / ANIMATION_MS, 1);
      const eased = easeOutQuad(progress);
      setDisplay(from + delta * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      fromRef.current = target;
    };
  }, [target, enabled]);

  return display.toFixed(decimals);
}
