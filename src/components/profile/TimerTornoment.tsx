"use client";

import React, { memo } from "react";
import { useCountdownFromEndAt } from "@/hooks/useCountdown";
import { MATCH_DURATION } from "@/utils/matchTimer";

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

interface TimerTornomentProps {
  endAt: number | null;
  duration?: number;
  active: boolean;
  onComplete?: () => void;
}

const TimerTornoment: React.FC<TimerTornomentProps> = ({
  endAt,
  duration = MATCH_DURATION,
  active,
  onComplete,
}) => {
  const remaining = useCountdownFromEndAt(endAt, active, onComplete);
  const percent = Math.min((remaining / duration) * 100, 100);

  return (
    <div className="flex w-full items-center gap-2">
      <span className="ml-2 rounded px-1.5 py-0.5 text-xs font-bold text-gray-800 dark:bg-white/10 dark:text-white bg-black/5">
        {fmt(remaining)}
      </span>
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/20">
        <div
          className="h-full rounded-full bg-gray-800 transition-[width] duration-1000 ease-linear dark:bg-white"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default memo(
  TimerTornoment,
  (a, b) => a.endAt === b.endAt && a.active === b.active,
);
