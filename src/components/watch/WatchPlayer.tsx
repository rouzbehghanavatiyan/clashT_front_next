"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import { useShowWatch } from "@/hooks/useShowWatch";
import { attachmentService } from "@/services/attachment.service";
import { VideoSlide } from "@/components/VideoSlide";
import LoadingChild from "@/components/LoadingChild";

function normalizeList(payload: any): any[] {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function WatchPlayer({ inviteId }: { inviteId: string }) {
  const [error, setError] = useState("");

  const {
    data,
    isLoading,
    openDropdowns,
    setOpenDropdowns,
    currentlyPlayingId,
    handleVideoPlay,
    toggleDropdown,
    dropdownItems,
    handleSlideChange,
    initializeSwiper,
  } = useShowWatch({
    inviteId,
    data: [],
    pagination: { skip: 0, take: 10, hasMore: true },
    useRedux: false,
    customFetchNextPage: async ({ skip, take, inviteId: id }) => {
      if (!id) return [];
      try {
        setError("");
        const res = await attachmentService.attachmentListByInviteId({
          skip,
          take,
          inviteId: id,
        });
        return normalizeList(res?.data);
      } catch (err) {
        console.error("Failed to load videos for invite:", err);
        setError("Could not load videos for this match.");
        return [];
      }
    },
  });

  return (
    <section
      aria-label="Match videos"
      className="relative w-full bg-black flex flex-col h-[calc(100svh-98px)] md:h-[calc(100vh-65px)]"
    >
      <div className="absolute top-3 left-3 z-20">
        <Link
          href="/watch"
          className="inline-flex items-center rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/70"
        >
          Back to Watch
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="absolute top-14 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
        >
          {error}
        </div>
      )}

      <Swiper
        direction="vertical"
        slidesPerView={1}
        mousewheel={true}
        onSlideChange={handleSlideChange}
        modules={[Mousewheel]}
        onInit={initializeSwiper}
        className="mySwiper w-full h-full"
      >
        {data?.map((video: any, index: number) => (
          <SwiperSlide key={`invite-video-${video.id || index}`}>
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
      </Swiper>

      {!isLoading && !error && data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">
          No videos found for this match.
        </div>
      )}

      <LoadingChild isLoading={isLoading} />
    </section>
  );
}
