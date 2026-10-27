"use client";

import React, { useCallback, useRef } from "react";
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
      inviteId: string | undefined;
    }) => {
      if (!params.inviteId) return [];
      try {
        const res = await attachmentService.followerAttachmentList({
          skip: params.skip,
          take: PAGE_SIZE,
          userIdLogin,
        });
        return res?.data?.data || [];
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
    customCleanup: () => { },
  });

  const waitingForUser = !userIdLogin;
  const showInitialSkeleton = waitingForUser || (isLoading && data.length === 0);

  return (
    <section
      aria-label="Home feed"
      className="relative mt-0 flex h-[calc(100svh-32px)] w-full flex-col bg-zinc-950 md:h-[calc(100vh-65px)]"
    >
      {showInitialSkeleton ? (
        <HomeSlideSkeleton />
      ) : (
        <Swiper
          direction="vertical"
          slidesPerView={1}
          mousewheel={true}
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
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/80">
          Follow creators to see matchups in your home feed.
        </div>
      )}
      <div ref={loadingRef} className="sr-only" />
    </section>
  );
};

export default HomeFeed;
