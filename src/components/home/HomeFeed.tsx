"use client";

import React, { useCallback, useRef } from "react";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import { useAppSelector } from "@/store/reduxHook";
import { useShowWatch } from "@/hooks/useShowWatch";
import { attachmentService } from "@/services/attachment.service";
import { VideoSlide } from "@/components/VideoSlide";
import { HomeSlideSkeleton } from "@/components/home/HomeSlideSkeleton";

const PAGE_SIZE = 6;

const HomeFeed: React.FC = () => {
  const loadingRef = useRef<HTMLDivElement>(null);
  const main = useAppSelector((state) => state.main);
  const { pagination, data: reduxData } = main.homeMatch;
  const userIdLogin = main?.userLogin?.user?.id || main?.userId;

  const customFetchNextPage = useCallback(
    async (params: {
      skip: number;
      take: number;
      inviteId: string | number | undefined;
    }) => {
      const userId = params.inviteId ?? userIdLogin;
      if (!userId) return [];
      try {
        const res = await attachmentService.followerAttachmentList({
          skip: params.skip,
          take: params.take || PAGE_SIZE,
          userIdLogin: userId,
        });
        const payload = res?.data?.data ?? res?.data ?? [];
        return Array.isArray(payload) ? payload : [];
      } catch (error) {
        console.error("Error fetching home feed:", error);
        return [];
      }
    },
    [userIdLogin],
  );

  const {
    data,
    isLoading,
    isFetchingMore,
    openDropdowns,
    setOpenDropdowns,
    currentlyPlayingId,
    handleVideoPlay,
    toggleDropdown,
    dropdownItems,
    handleSlideChange,
    initializeSwiper,
  } = useShowWatch({
    inviteId: userIdLogin,
    data: reduxData,
    pagination,
    customFetchNextPage,
    useRedux: false,
  });

  const waitingForUser = !userIdLogin;
  const showInitialSkeleton = waitingForUser || (isLoading && data.length === 0);

  return (
    <section
      aria-label="Home feed"
      className="relative mt-0 flex h-[calc(100svh-44px)] w-full flex-col bg-black md:h-[calc(100vh-65px)]"
    >
      {showInitialSkeleton ? (
        <HomeSlideSkeleton />
      ) : (
        <Swiper
          direction="vertical"
          slidesPerView={1}
          mousewheel={true}
          noSwipingClass="swiper-no-swiping"
          onSlideChange={handleSlideChange}
          modules={[Mousewheel]}
          onInit={initializeSwiper}
          className="mySwiper h-full w-full"
        >
          {data?.map((video: any, index: number) => (
            <SwiperSlide key={`video-${video.id || index}`}>
              <VideoSlide
                showLiked={false}
                endTime={false}
                showScore={true}
                showResult={true}
                showCountLiked={true}
                video={video}
                index={index}
                currentlyPlayingId={currentlyPlayingId}
                openDropdowns={openDropdowns}
                onVideoPlay={handleVideoPlay}
                toggleDropdown={toggleDropdown}
                dropdownItems={dropdownItems}
                setOpenDropdowns={setOpenDropdowns}
              />
            </SwiperSlide>
          ))}
          {isFetchingMore && (
            <SwiperSlide key="home-loading-more">
              <HomeSlideSkeleton />
            </SwiperSlide>
          )}
        </Swiper>
      )}
      {!showInitialSkeleton && !isLoading && (!data || data.length === 0) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/90 px-6">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-8 text-center shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-gray-400">
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 28 }} />
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Respectfully, there are currently{" "}
              <span className="text-base font-extrabold text-white">
                no followers
              </span>{" "}
              on your profile.
            </p>
            <Link
              href="/watch"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Watch
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Link>
          </div>
        </div>
      )}
      <div ref={loadingRef} className="sr-only" />
    </section>
  );
};

export default HomeFeed;
