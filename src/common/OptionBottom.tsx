import React, { useState, useEffect, useMemo } from "react";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";

const OptionBottom: React.FC<any> = ({
  handleToggleComments,
  video,
  endTime,
  result,
  showLiked,
  positionVideo,
  countLiked,
  externalIsLiked,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  // محاسبه movieId بر اساس positionVideo
  const movieId = useMemo(() => {
    return positionVideo === 0
      ? video?.attachmentInserted?.attachmentId
      : video?.attachmentMatched?.attachmentId;
  }, [video, positionVideo]);

  // محاسبه وضعیت اولیه لایک برای این movieId خاص
  useEffect(() => {
    if (!movieId) return;

    // اگر video.likes داریم و این movieId در آن وجود دارد
    if (video?.likes?.[movieId]) {
      setIsLiked(video.likes[movieId].isLiked || false);
    } else {
      // اگر ساختار قدیمی داریم (isLikedInserted/isLikedMatched)
      const initialLikeStatus =
        positionVideo === 0 ? video?.isLikedInserted : video?.isLikedMatched;
      setIsLiked(initialLikeStatus || false);
    }
  }, [video, positionVideo, movieId]);

  // اگر externalIsLiked تغییر کرد، state را آپدیت کن
  useEffect(() => {
    if (externalIsLiked !== undefined) {
      setIsLiked(externalIsLiked);
    }
  }, [externalIsLiked]);

  const currentLikeCount = useMemo(() => {
    if (countLiked !== undefined) return countLiked;

    // اول از video.likes چک کن
    if (video?.likes?.[movieId]) {
      const likeInfo = video.likes[movieId];
      return isLiked ? likeInfo.count + 1 : Math.max(0, likeInfo.count - 1);
    }

    // اگر video.likes نبود، از ساختار قدیمی استفاده کن
    const baseCount =
      positionVideo === 0 ? video?.likeInserted || 0 : video?.likeMatched || 0;

    // اگر کاربر لایک کرد/آنلایک کرد، تعداد را آپدیت کن
    return isLiked ? baseCount + 1 : Math.max(0, baseCount - 1);
  }, [countLiked, video, positionVideo, isLiked, movieId]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 bg-gradient-to-t from-zinc-700/45 via-zinc-600/20 to-transparent px-2 pt-7 pb-2">
      <div className="flex justify-between">
        <div className="pointer-events-auto flex items-end justify-start">
          <ChatBubbleOutlineIcon
            onClick={() => handleToggleComments(video)}
            className="font25 cursor-pointer text-white"
          />
        </div>
        {endTime ? null : result === "Win" ? (
          <div className="pointer-events-auto flex items-center justify-center">
            <span className="px-2 text-sm font-bold text-green-500">
              Win
            </span>
          </div>
        ) : result === "Loss" ? (
          <div className="pointer-events-auto flex items-center justify-center">
            <span className="px-2 text-sm font-bold text-red-500">
              Loss
            </span>
          </div>
        ) : result === "Draw" ? (
          <div className="pointer-events-auto flex items-center justify-center">
            <span className="px-2 text-sm font-bold text-yellow-400">
              Draw
            </span>
          </div>
        ) : null}
        <div className="pointer-events-none flex items-center justify-end gap-1 text-gray-400">
          {showLiked && movieId && (
            <>
              {isLiked ? (
                <ThumbUpIcon
                  className="font35 text-gray-400"
                  aria-disabled
                />
              ) : (
                <ThumbUpOffAltIcon
                  className="font35 text-gray-400"
                  aria-disabled
                />
              )}
            </>
          )}
          {!endTime && currentLikeCount !== undefined && movieId ? (
            <div className="flex items-center gap-1 leading-none text-gray-400">
              <span className="text-sm font-semibold leading-none">
                {currentLikeCount}
              </span>
              <ThumbUpIcon
                className="text-gray-400"
                sx={{ fontSize: 18, display: "block" }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OptionBottom;
