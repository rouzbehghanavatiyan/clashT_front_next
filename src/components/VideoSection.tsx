import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/reduxHook";
import OptionTop from "@/common/OptionTop";
import OptionBottom from "@/common/OptionBottom";
import Comments from "@/common/Comments";
import StringHelpers from "@/utils/StringHelpers";
import Video from "./Video";

const VideoSection: React.FC<any> = ({
  score,
  isLiked: externalIsLiked,
  isFollowed: externalIsFollowed,
  endTime,
  onVideoPlay,
  video,
  showLiked = false,
  setOpenDropdowns,
  result,
  toggleDropdown,
  dropdownItems,
  openDropdowns,
  isPlaying,
  positionVideo,
  countLiked,
}) => {
  const main = useAppSelector((state) => state?.main);
  const [commentUserInfo, setCommentUserInfo] = useState<any>({});
  const [showComments, setShowComments] = useState(false);
  const userIdLogin = main?.userLogin?.user?.id;
  const socket = main?.socketConfig;

  const handleToggleComments = (videoData: any) => {
    setCommentUserInfo(videoData);
    setShowComments(true);
  };

  const videoUrl =
    positionVideo === 0
      ? StringHelpers?.getProfile(video?.attachmentInserted)
      : StringHelpers?.getProfile(video?.attachmentMatched);

  return (
    <div className="h-full w-full relative flex flex-col border-b border-gray-800 min-h-0">
      <OptionTop
        main={main}
        video={video}
        userIdLogin={userIdLogin}
        positionVideo={positionVideo}
        openDropdowns={openDropdowns}
        score={score}
        setOpenDropdowns={setOpenDropdowns}
        toggleDropdown={toggleDropdown}
        dropdownItems={dropdownItems}
      />
      <div className="flex-1 bg-red min-h-0 relative  flex items-center justify-center">
        <div className="relative w-full h-full flex items-center  justify-center bg-black overflow-hidden">
          <Video
            videoId={video?.id}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            loop
            playing={isPlaying}
            handleVideo={() => onVideoPlay(video)}
            url={videoUrl}
          />
          <OptionBottom
            socket={socket}
            userIdLogin={userIdLogin}
            handleToggleComments={handleToggleComments}
            video={video}
            endTime={endTime}
            result={result}
            showLiked={showLiked}
            externalIsLiked={externalIsLiked}
            positionVideo={positionVideo}
            countLiked={
              positionVideo === 0 ? video?.likeInserted : video?.likeMatched
            }
          />
        </div>
      </div>
      {showComments && (
        <Comments
          positionVideo={positionVideo}
          commentUserInfo={commentUserInfo}
          showComments={showComments}
          setShowComments={setShowComments}
        />
      )}
    </div>
  );
};

export default VideoSection;
