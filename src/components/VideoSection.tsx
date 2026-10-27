import React, { useState } from "react";
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
    <div className="relative flex h-full min-h-0 w-full flex-col border-b border-white/10">
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
      <div className="relative min-h-0 flex-1">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
          <Video
            className="h-full w-full object-contain"
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
