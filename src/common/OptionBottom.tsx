"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { userService } from "@/services/user.service";
import { socket } from "@/lib/socket";
import { fixNumberCount } from "@/utils/fileHelper";

type MatchResult = "Win" | "Loss" | "Draw" | null;

interface LikeInfo {
  count?: number;
  isLiked?: boolean;
}

interface OptionBottomProps {
  handleToggleComments: (video?: any) => void;
  video: any;
  endTime?: boolean;
  result?: MatchResult;
  showLiked?: boolean;
  positionVideo: number;
  userIdLogin?: string | number | null;
  countLiked?: number | null;
  externalIsLiked?: boolean;
  itsMatchingWithTimer?: any;
  showCountLiked?: any;
  inviteWatch?: boolean;
  profileWatch?: boolean;
  itsHome?: boolean;
  videoLikes?: Record<string, number>;
}

const RESULT_STYLES: Record<
  Exclude<MatchResult, null>,
  { className: string; text: string }
> = {
  Win: { className: "text-[#1ec75f]", text: "Win" },
  Loss: { className: "text-[#f12d2d]", text: "Loss" },
  Draw: { className: "text-[#eab308]", text: "Draw" },
};

const OptionBottom: React.FC<OptionBottomProps> = ({
  handleToggleComments,
  video,
  inviteWatch = false,
  endTime,
  result,
  videoLikes,
  positionVideo,
  profileWatch = false,
  userIdLogin,
  countLiked,
  externalIsLiked,
  itsHome = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);

  const movieId = useMemo(() => {
    if (!video) return null;
    return positionVideo === 0
      ? video?.attachmentInserted?.attachmentId
      : video?.attachmentMatched?.attachmentId;
  }, [video, positionVideo]);

  const canLike = useMemo(
    () => Boolean(endTime && (inviteWatch || profileWatch || itsHome)),
    [endTime, inviteWatch, profileWatch, itsHome],
  );

  const shouldShowLikeCount = useMemo(
    () => Boolean(endTime && (itsHome || profileWatch) && !inviteWatch),
    [endTime, itsHome, profileWatch, inviteWatch],
  );

  const shouldShowWaitingLike = useMemo(
    () => Boolean(!endTime && (inviteWatch || profileWatch || itsHome)),
    [endTime, inviteWatch, profileWatch, itsHome],
  );

  const likeInfo: LikeInfo | undefined = useMemo(() => {
    if (!movieId || !video?.likes) return undefined;
    return video.likes[movieId];
  }, [video, movieId]);

  const computedResult: MatchResult = useMemo(() => {
    if (!video) return null;

    const insertedId = video?.attachmentInserted?.attachmentId;
    const matchedId = video?.attachmentMatched?.attachmentId;
    const insertedCount = Math.max(
      0,
      (video?.likeInserted ?? 0) +
        (insertedId ? (videoLikes?.[insertedId] ?? 0) : 0),
    );
    const matchedCount = Math.max(
      0,
      (video?.likeMatched ?? 0) +
        (matchedId ? (videoLikes?.[matchedId] ?? 0) : 0),
    );

    if (insertedCount === matchedCount) return "Draw";
    const insertedWins = insertedCount > matchedCount;
    if (positionVideo === 0) return insertedWins ? "Win" : "Loss";
    return insertedWins ? "Loss" : "Win";
  }, [video, videoLikes, positionVideo]);

  const resultStyle = useMemo(() => {
    if (!result || !computedResult) return null;
    return RESULT_STYLES[computedResult];
  }, [result, computedResult]);

  useEffect(() => {
    let baseCount = 0;

    if (countLiked != null) {
      baseCount = countLiked;
    } else if (video && movieId) {
      if (likeInfo) {
        baseCount = likeInfo.count ?? 0;
      } else {
        baseCount =
          positionVideo === 0
            ? (video?.likeInserted ?? 0)
            : (video?.likeMatched ?? 0);
      }
    }

    const socketDelta =
      movieId && videoLikes?.[movieId] ? videoLikes[movieId] : 0;

    setLocalLikeCount(Math.max(0, baseCount + socketDelta));
  }, [countLiked, video, positionVideo, movieId, videoLikes, likeInfo]);

  useEffect(() => {
    if (!movieId || !video) return;
    if (likeInfo) {
      setIsLiked(Boolean(likeInfo.isLiked));
      return;
    }
    const initialLikeStatus =
      positionVideo === 0 ? video?.isLikedInserted : video?.isLikedMatched;
    setIsLiked(Boolean(initialLikeStatus));
  }, [video, positionVideo, movieId, likeInfo]);

  useEffect(() => {
    if (externalIsLiked !== undefined) {
      setIsLiked(Boolean(externalIsLiked));
    }
  }, [externalIsLiked]);

  const handleLikeClick = useCallback(async () => {
    if (!movieId || !userIdLogin || !canLike) return;

    const previousLikeStatus = isLiked;
    const newLikeStatus = !previousLikeStatus;
    setIsLiked(newLikeStatus);
    setLocalLikeCount((prev) =>
      newLikeStatus ? prev + 1 : Math.max(0, prev - 1),
    );

    const postData = { userId: userIdLogin, movieId };

    try {
      if (previousLikeStatus) {
        const response = await userService.removeLike(postData);
        if (response?.data?.status !== 0) {
          throw new Error(response?.data?.message || "Remove like failed");
        }
        socket.emit("remove_liked", postData);
        return;
      }

      const response = await userService.addLike(postData);
      if (response?.data?.status !== 0) {
        throw new Error(response?.data?.message || "Add like failed");
      }
      socket.emit("add_liked", postData);
    } catch (error: any) {
      console.error(
        "Like update error:",
        error?.response?.data || error?.message || error,
      );
      window.alert("Failed to update like status");
      setIsLiked(previousLikeStatus);
      setLocalLikeCount((prev) =>
        previousLikeStatus ? prev + 1 : Math.max(0, prev - 1),
      );
    }
  }, [isLiked, movieId, userIdLogin, canLike]);

  return (
    <div className="pointer-events-none absolute inset-x-16 bottom-4 z-[6] sm:inset-x-24">
      <div className="flex items-center justify-between gap-0.5">
        <div className="flex flex-1 items-center justify-start">
          <button
            type="button"
            onClick={() => handleToggleComments(video)}
            className="pointer-events-auto text-white"
            aria-label="Open comments"
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {shouldShowWaitingLike && resultStyle && (
          <div className="flex flex-1 items-center justify-center">
            <span className={`px-1 text-sm font-bold ${resultStyle.className}`}>
              {resultStyle.text}
            </span>
          </div>
        )}

        <div className="flex flex-1 items-center justify-end">
          <div className="flex items-center gap-1">
            {canLike && (
              <button
                type="button"
                onClick={handleLikeClick}
                className="pointer-events-auto p-2 text-white"
                aria-label={isLiked ? "Remove vote" : "Vote"}
              >
                {isLiked ? (
                  <StarIcon sx={{ fontSize: 22, color: "#facc15" }} />
                ) : (
                  <StarBorderIcon sx={{ fontSize: 22 }} />
                )}
              </button>
            )}

            {shouldShowLikeCount && (
              <span className="text-sm text-gray-200">
                {fixNumberCount(localLikeCount)}
              </span>
            )}

            {shouldShowWaitingLike && (
              <div
                className="flex items-center gap-1.5"
                aria-disabled="true"
                title="Voting is disabled after the match ends"
              >
                <StarIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                <span className="min-w-[1ch] text-sm font-bold tabular-nums text-white">
                  {fixNumberCount(localLikeCount)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OptionBottom);
