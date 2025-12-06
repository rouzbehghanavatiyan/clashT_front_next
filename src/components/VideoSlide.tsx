import React from "react";
import VideoSection from "./VideoSection";

interface VideoSlideProps {
  video: any;
  index: number;
  currentlyPlayingId: string | null;
  openDropdowns: Record<number, boolean>;
  endTime: boolean;
  showScore: boolean;
  showResult: boolean;
  showLiked: boolean;
  showCountLiked: boolean;
  onVideoPlay: (attachmentId: string) => void;
  toggleDropdown: (index: number) => void;
  dropdownItems: (data: any, position: number, userSenderId: any) => any[];
  setOpenDropdowns: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
}

export const VideoSlide: React.FC<VideoSlideProps> = ({
  video,
  currentlyPlayingId,
  openDropdowns,
  onVideoPlay,
  toggleDropdown,
  dropdownItems,
  setOpenDropdowns,
  endTime,
  showScore,
  showResult,
  showLiked,
  showCountLiked,
}) => {
  const resultInserted =
    video?.likeInserted > video?.likeMatched
      ? "Win"
      : video?.likeInserted < video?.likeMatched
        ? "Loss"
        : "Draw";

  const resultMatched =
    video?.likeInserted < video?.likeMatched
      ? "Win"
      : video?.likeInserted > video?.likeMatched
        ? "Loss"
        : "Draw";

  const videoSections = [
    {
      likeCount: video?.likeInserted,
      attachment: video.attachmentInserted,
      position: 0,
      score: video?.scoreInserted,
      user: video.userInserted,
      isLiked:
        video.likes?.[video.attachmentInserted?.attachmentId]?.isLiked || false,
      result: resultInserted,
    },
    {
      likeCount: video?.likeMatched,
      score: video?.scoreMatched,
      attachment: video.attachmentMatched,
      position: 1,
      user: video.userMatched,
      isLiked:
        video.likes?.[video.attachmentMatched?.attachmentId]?.isLiked || false,
      result: resultMatched,
    },
  ];

  console.log(video);

  return (
    <>
      {videoSections.map((section, sectionIndex) => {

        return (
          <div key={sectionIndex} className="h-1/2 relative">
            <VideoSection
              externalIsLiked={showLiked ? true : false}
              score={showScore ? section?.score : null}
              result={showResult ? section?.result : null}
              showLiked={showLiked ? true : false}
              countLiked={showCountLiked ? section?.likeCount : null}
              endTime={endTime}
              video={video}
              isPlaying={
                currentlyPlayingId === section.attachment?.attachmentId
              }
              onVideoPlay={() => onVideoPlay(section.attachment?.attachmentId)}
              toggleDropdown={() => toggleDropdown(section.position)}
              dropdownItems={() =>
                dropdownItems(video, section.position, section.user)
              }
              setOpenDropdowns={setOpenDropdowns}
              openDropdowns={openDropdowns}
              positionVideo={section.position}
              isLiked={section.isLiked}
            />
          </div>
        );
      })}
    </>
  );
};
