"use client";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ImageRank from "@/components/ImageRank";
import StringHelpers from "@/utils/StringHelpers";
import TimerTornoment from "@/components/profile/TimerTornoment";

export type MatchResult = "Win" | "Loss" | "Draw";

export type MatchSide = {
  userName?: string;
  profile?: any;
  likes?: number;
  score?: number;
  result?: MatchResult;
};

type MatchInfoCardProps = {
  left: MatchSide;
  right: MatchSide;
  isLive?: boolean;
  endAt?: number | null;
  onTimerComplete?: () => void;
};

function MatchPlayer({
  side,
  align = "left",
  hideScore,
}: {
  side: MatchSide;
  align?: "left" | "right";
  hideScore: boolean;
}) {
  const avatar = StringHelpers.getProfile(side.profile);
  const isRight = align === "right";
  const showReward = !hideScore && side.result === "Win";

  return (
    <div
      className={`flex min-w-0 flex-1 items-start gap-2 ${
        isRight ? "flex-row-reverse text-right" : "text-left"
      }`}
    >
      <ImageRank
        imgSrc={avatar || undefined}
        imgSize={40}
        score={hideScore ? -1 : typeof side.score === "number" ? side.score : -1}
        onClickDisable
      />
      <div className={`min-w-0 flex-1 ${isRight ? "items-end" : "items-start"} flex flex-col`}>
        <p className="w-full truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
          {side.userName || "User"}
        </p>
        {!hideScore && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Score {side.score ?? 0}
          </p>
        )}
        {showReward && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-xl bg-[#1ec75f]/15 px-2 py-0.5">
            <TrendingUpIcon sx={{ fontSize: 13, color: "#1ec75f" }} />
            <span className="text-[11px] font-bold text-[#1ec75f]">
              +10% Rank
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

export default function MatchInfoCard({
  left,
  right,
  isLive = false,
  endAt = null,
  onTimerComplete,
}: MatchInfoCardProps) {
  const hideScore =
    isLive || left.result === "Draw" || right.result === "Draw";

  return (
    <div className="flex flex-col gap-2.5 rounded-b-xl border border-t-0 border-gray-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      {isLive && (
        <TimerTornoment endAt={endAt} active onComplete={onTimerComplete} />
      )}

      <div className="flex items-start gap-2">
        <MatchPlayer side={left} align="left" hideScore={hideScore} />
        <MatchPlayer side={right} align="right" hideScore={hideScore} />
      </div>
    </div>
  );
}
