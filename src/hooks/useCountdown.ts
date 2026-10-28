"use client";

import { useEffect, useRef, useState } from "react";

export function useCountdown(active: boolean, startTime: number) {
  const [seconds, setSeconds] = useState(startTime);

  useEffect(() => {
    if (!active) {
      setSeconds(startTime);
      return;
    }

    setSeconds(startTime);
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, startTime]);

  return seconds;
}

export function useCountdownFromEndAt(
  endAt: number | null,
  active: boolean,
  onComplete?: () => void,
) {
  const remainingSeconds = () =>
    endAt ? Math.max(0, Math.ceil((endAt - Date.now()) / 1000)) : 0;

  const [seconds, setSeconds] = useState(remainingSeconds);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    if (!endAt || !active) {
      setSeconds(remainingSeconds());
      return;
    }

    const tick = () => {
      const next = remainingSeconds();
      setSeconds(next);
      if (next <= 0 && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endAt, active, onComplete]);

  return seconds;
}
