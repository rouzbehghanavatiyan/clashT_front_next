"use client";

import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Timer from "../../../components/Timer";
import StringHelpers from "../../../utils/helpers/StringHelper";
import VideoSection from "../../../common/VideoSection";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ReportIcon from "@mui/icons-material/Report";
import EmailIcon from "@mui/icons-material/Email";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../../hooks/reduxHookType";
import VideoItemSkeleton from "../../../components/VideoLoading";
import { RsetLastMatch } from "../../../common/Slices/main";
import LoadingChild from "../../../components/Loading/LoadingChild";

interface VideosProfileProps {
  isLoading: boolean;
  match: any[];
  videoLikes: Record<string, number>;
  loadingRef: React.RefObject<HTMLDivElement | null> | any;
}

const VideosProfile = forwardRef<HTMLDivElement, VideosProfileProps>(
  ({ loadingRef, isLoading, match, videoLikes }, ref) => {
    const [openDropdowns, setOpenDropdowns] = useState<
      Record<string | number, boolean>
    >({});
    const router = useRouter();
    const dispatch = useAppDispatch();
    const firstVideoRef = useRef<HTMLDivElement>(null);

    const videoGroupsWithLikes = useMemo(() => {
      return match?.map((video: any) => {
        const parentLikes =
          (videoLikes[video?.attachmentInserted?.attachmentId] || 0) +
          (video.likeInserted || 0);
        const childLikes = video.child
          ? (videoLikes[video.attachmentMatched?.attachmentId] || 0) +
            (video.likeMatched || 0)
          : 0;

        return {
          ...video,
          parentLikes,
          childLikes,
          parentMovieId: video?.attachmentInserted?.attachmentId,
          childMovieId: video?.attachmentMatched?.attachmentId,
          likeInserted: video?.likeInserted,
          likeMatched: video?.likeMatched,
        };
      });
    }, [match, videoLikes]);

    const dropdown = (data: any, position: number, userSenderId: any) => {
      const temp = {
        sender: position === 0 ? data?.userInserted?.id : data?.userMatched?.id,
        userProfile:
          position === 0
            ? StringHelpers.getProfile(data?.profileInserted)
            : StringHelpers.getProfile(data?.profileMatched),
        userNameSender:
          position === 0
            ? data?.userInserted?.userName
            : data?.userMatched?.userName,
      };

      return [
        {
          label: "Send message",
          icon: <EmailIcon className="text-gray-800 font20" />,
          onClick: () => {
            // در Next.js استیت به صورت Query ارسال می‌شود یا از Redux استفاده می‌شود
            const serializedInfo = encodeURIComponent(JSON.stringify(temp));
            router.push(
              `/privateMessage?id=${userSenderId?.id}&userInfo=${serializedInfo}`,
            );
          },
        },
        {
          label: "Report",
          icon: <ReportIcon className="text-gray-800 font20" />,
          onClick: () => alert("اعلان‌ها"),
        },
        {
          label: "Save",
          icon: <TurnedInNotIcon className="text-gray-800 font20" />,
          onClick: () => alert("اعلان‌ها"),
        },
        { divider: true },
      ];
    };

    const toggleDropdown = (video: any, index: number) => {
      setOpenDropdowns((prev: any) => {
        if (index === 0 || index === 1) {
          return {
            ...prev,
            [index]: !prev[index],
          };
        }
        return prev;
      });
    };

    useEffect(() => {
      if (videoGroupsWithLikes?.length > 0) {
        dispatch(RsetLastMatch(videoGroupsWithLikes?.[0]));
      }
    }, [videoGroupsWithLikes, dispatch]);

    return (
      <div ref={ref}>
        <div className="col-span-12 justify-center flex md:col-span-12 lg:col-span-12 border-t-[1px]">
          <div className="grid grid-cols-1 w-full">
            {isLoading ? (
              [...Array(videoGroupsWithLikes?.length || 3)].map((_, index) => (
                <div key={`skeleton-${index}`} className="bg-black">
                  <VideoItemSkeleton section="itsProfile" />
                </div>
              ))
            ) : videoGroupsWithLikes?.length === 0 ? (
              <div className="flex h-[calc(50vh-100px)] justify-center items-center">
                <span className="font-bold">Empty videos</span>
              </div>
            ) : (
              videoGroupsWithLikes?.map((video: any, index: number) => {
                const parentLikes =
                  (videoLikes[video?.parentMovieId] || 0) +
                  (video?.likeInserted || 0);
                const childLikes =
                  (videoLikes[video?.childMovieId] || 0) +
                  (video?.likeMatched || 0);
                const endTime =
                  video?.inviteMatched?.insertDate !== -1 ||
                  video?.inviteInserted?.insertDate !== -1;
                const startTime = video?.inviteMatched?.insertDate;
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

                return (
                  <section
                    key={video?.id || index}
                    ref={index === 0 ? firstVideoRef : null}
                    className={`flex pt-1 bg-white flex-col relative h-[calc(100vh-105px)] ${
                      index === 0 ? "first-video scroll-mt-[60px]" : ""
                    }`}
                  >
                    <div className="flex-1 min-h-0">
                      <VideoSection
                        endTime={endTime}
                        score={video?.scoreInserted}
                        result={resultInserted}
                        toggleDropdown={() => toggleDropdown(video, 0)}
                        countLiked={parentLikes}
                        video={video}
                        dropdownItems={() =>
                          dropdown(video, 0, video?.userInserted)
                        }
                        setOpenDropdowns={setOpenDropdowns}
                        openDropdowns={openDropdowns}
                        positionVideo={0}
                      />
                      {endTime && (
                        <div className="absolute top-28 right-5 z-50 flex gap-1 text-white justify-center items-end">
                          {parentLikes}
                          <ThumbUpIcon className="font25 text-white" />
                        </div>
                      )}
                    </div>

                    {endTime && (
                      <div className="w-full absolute top-2/4 z-50">
                        <div className="w-5/6 ms-8 flex rounded-full items-center justify-center text-white">
                          <Timer
                            video={video}
                            startTime={startTime}
                            duration={3600}
                            active={true}
                            onComplete={() => {}}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex-1 min-h-0 relative">
                      <VideoSection
                        endTime={endTime}
                        score={video?.scoreMatched}
                        result={resultMatched}
                        toggleDropdown={() => toggleDropdown(video, 1)}
                        countLiked={childLikes}
                        video={video}
                        dropdownItems={() =>
                          dropdown(video, 1, video?.userMatched)
                        }
                        openDropdowns={openDropdowns}
                        setOpenDropdowns={setOpenDropdowns}
                        positionVideo={1}
                      />
                      {endTime && (
                        <div className="absolute top-28 right-5 z-50 flex gap-1 text-white justify-center items-end">
                          {childLikes}
                          <ThumbUpIcon className="font25 text-white" />
                        </div>
                      )}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </div>
        <LoadingChild ref={loadingRef} isLoading={isLoading} />
      </div>
    );
  },
);

VideosProfile.displayName = "VideosProfile";

export default VideosProfile;
