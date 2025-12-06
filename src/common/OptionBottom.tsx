import React, { useState, useEffect, useCallback, useMemo } from "react";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { userService } from "@/services/user.service";
import { updateLikeStatus } from "@/store/slices/mainSlice";
import { useAppDispatch } from "@/store/reduxHook";

const OptionBottom: React.FC<any> = ({
  handleToggleComments,
  video,
  endTime,
  result,
  showLiked,
  positionVideo,
  userIdLogin,
  countLiked,
  externalIsLiked,
  socket,
}) => {
  const dispatch = useAppDispatch();
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

  const handleLikeClick = useCallback(async () => {
    if (!movieId) return;

    // وضعیت جدید (معکوس وضعیت فعلی)
    const newLikeStatus = !isLiked;

    setIsLiked(newLikeStatus);

    const postData = {
      userId: userIdLogin || null,
      movieId: movieId,
    };

    try {
      if (isLiked) {
        await userService.removeLike(postData);
        if (socket) {
          socket.emit("remove_liked", postData);
        }
      } else {
        await userService.addLike(postData);
        if (socket) {
          socket.emit("add_liked", postData);
        }
      }
      dispatch(
        updateLikeStatus({
          movieId,
          isLiked: newLikeStatus,
          positionVideo,
        })
      );
    } catch (error) {
      console.error("Error in like operation:", error);
      // در صورت خطا، UI را به حالت قبلی برگردان
      setIsLiked(isLiked);
    }
  }, [isLiked, movieId, userIdLogin, socket, dispatch, positionVideo]);

  // تعداد لایک‌ها را برای این movieId خاص محاسبه کن
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
    <div className="absolute w-full bottom-5 z-10">
      <div className="flex mb-4 justify-between mx-2">
        <div className="col-span-1  flex items-end justify-start">
          <ChatBubbleOutlineIcon
            onClick={() => handleToggleComments(video)}
            className="font25  text-white"
          />
        </div>
        {endTime ? null : result === "Win" ? (
          <div className="text-green col-span-1 flex items-center justify-center">
            <span className="font15 border-green px-2 rounded-lg border font-bold">
              Win
            </span>
          </div>
        ) : result === "Loss" ? (
          <div className="text-red col-span-1 flex items-center justify-center">
            <span className="font15 border-red px-2 rounded-lg border font-bold">
              Loss
            </span>
          </div>
        ) : result === "Draw" ? (
          <div className="text-yellow col-span-1 flex items-center justify-center">
            <span className="font15 border-yellow px-2 rounded-lg border font-bold">
              Draw
            </span>
          </div>
        ) : null}
        <div className="col-span-1 flex justify-end">
          {showLiked && movieId && (
            <>
              {isLiked ? (
                <ThumbUpIcon
                  className="text-white font35  unlike_animation cursor-pointer"
                  onClick={handleLikeClick}
                />
              ) : (
                <ThumbUpOffAltIcon
                  className="text-white font35  cursor-pointer"
                  onClick={handleLikeClick}
                />
              )}
            </>
          )}
          {!endTime && currentLikeCount !== undefined && movieId ? (
            <div className="text-gray-600 flex items-end justify-end gap-2">
              <span className="font18 text-sm">{currentLikeCount}</span>
              <span className=" pb-1">
                <ThumbUpIcon className=" font25 unlike_animation cursor-pointer" />
              </span>
            </div>
          ) : (
            <div> </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionBottom;
