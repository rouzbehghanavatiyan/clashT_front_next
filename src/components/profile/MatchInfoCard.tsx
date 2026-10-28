"use client";

import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ImageRank from "@/components/ImageRank";
import StringHelpers from "@/utils/StringHelpers";

export type MatchResult = "Win" | "Loss" | "Draw";

export type MatchSide = {
  userName?: string;
  profile?: any;
  likes?: number;
  score?: number;
  result?: MatchResult;
};

function resultClass(result?: MatchResult) {
  if (result === "Win") return "text-green-500";
  if (result === "Loss") return "text-red-500";
  return "text-yellow-400";
}

function Side({ side }: { side: MatchSide }) {
  const avatar = StringHelpers.getProfile(side.profile);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <ImageRank
        imgSrc={avatar || undefined}
        imgSize={36}
        score={typeof side.score === "number" ? side.score : -1}
        onClickDisable
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
          {side.userName || "User"}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-0.5">
            <ThumbUpIcon sx={{ fontSize: 12 }} />
            {side.likes ?? 0}
          </span>
          <span>Score {side.score ?? 0}</span>
          <span className={`font-bold ${resultClass(side.result)}`}>
            {side.result}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MatchInfoCard({
  left,
  right,
  isLive,
}: {
  left: MatchSide;
  right: MatchSide;
  isLive?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-b-xl border border-t-0 border-gray-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
      <Side side={left} />
      <div className="shrink-0 text-center">
        {isLive ? (
          <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Live
          </span>
        ) : (
          <span className="text-xs font-semibold text-gray-400">VS</span>
        )}
      </div>
      <Side side={right} />
    </div>
  );
}
