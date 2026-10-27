"use client";

import { useEffect, useState } from "react";

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
