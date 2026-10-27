"use client";

import React, { memo } from "react";
import { MATCHING_DURATION_SECONDS } from "@/components/TimerForFindMatch";
import { useCountdown } from "@/hooks/useCountdown";

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

interface ButtonTimerProps {
  show: boolean;
  startTime?: number;
  onCancel?: () => void;
  canceling?: boolean;
}

const ButtonTimer: React.FC<ButtonTimerProps> = ({
  show,
  startTime = MATCHING_DURATION_SECONDS,
  onCancel,
  canceling = false,
}) => {
  const remaining = useCountdown(show, startTime);
  const percent = Math.min((remaining / startTime) * 100, 100);

  if (!show) return null;

  return (
    <div className="flex w-full items-center gap-3">
      <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-bold text-white">
        {fmt(remaining)}
      </span>
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white transition-[width] duration-1000 ease-linear"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-medium text-white/80">Matching</span>
      <span
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
        aria-hidden
      />
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={canceling}
          className="shrink-0 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          {canceling ? "Canceling..." : "Cancel"}
        </button>
      )}
    </div>
  );
};

export default memo(ButtonTimer);
