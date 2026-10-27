"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { attachmentService } from "@/services/attachment.service";
import { VideoSlide } from "@/components/VideoSlide";
import { HomeSlideSkeleton } from "@/components/home/HomeSlideSkeleton";

const PAGE_SIZE = 6;

function normalizeList(payload: any): any[] {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

const getKey = (v: any, i: number) =>
  `invite-${v?.inviteInserted?.id ?? v?.attachmentInserted?.id ?? i}`;

export default function WatchPlayer({ inviteId }: { inviteId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState("");
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<any>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>(
    {}
  );

  const skipRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);

  const loadPage = useCallback(async () => {
    if (!inviteId || loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    const myRequestId = ++requestIdRef.current;
    const isInitial = skipRef.current === 0;
    if (isInitial) setIsLoading(true);
    else setIsFetchingMore(true);
    setError("");

    try {
      const numericId = Number(inviteId);
      const res = await attachmentService.attachmentListByInviteId({
        skip: skipRef.current,
        take: PAGE_SIZE,
        inviteId: Number.isNaN(numericId) ? inviteId : numericId,
      });

      if (myRequestId !== requestIdRef.current) return; // پاسخ کهنه

      const list = normalizeList(res?.data);
      const isFirstPage = skipRef.current === 0;

      skipRef.current += list.length;
      if (list.length < PAGE_SIZE) hasMoreRef.current = false;

      setData((prev) => {
        const seen = new Set(prev.map((p) => p?.inviteInserted?.id));
        return [
          ...prev,
          ...list.filter((i) => !seen.has(i?.inviteInserted?.id)),
        ];
      });

      if (isFirstPage && list[0]) {
        setCurrentlyPlayingId(list[0]?.attachmentInserted?.attachmentId ?? null);
      }
    } catch (err) {
      if (myRequestId !== requestIdRef.current) return;
      console.error("Failed to load videos for invite:", err);
      hasMoreRef.current = false; // جلوگیری از تلاش بی‌پایان بعد از خطا
      setError("Could not load videos for this match.");
    } finally {
      if (myRequestId === requestIdRef.current) {
        loadingRef.current = false;
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    }
  }, [inviteId]);

  // فقط وقتی inviteId عوض شد: ریست و بارگذاری صفحه اول
  useEffect(() => {
    skipRef.current = 0;
    hasMoreRef.current = true;
    loadingRef.current = false;
    setData([]);
    setCurrentlyPlayingId(null);
    setOpenDropdowns({});
    loadPage();
  }, [inviteId, loadPage]);

  const handleSlideChange = (swiper: SwiperType) => {
    const current = data[swiper.activeIndex];
    setCurrentlyPlayingId(current?.attachmentInserted?.attachmentId ?? null);
    setOpenDropdowns({});
    if (
      swiper.activeIndex > 0 &&
      (swiper.activeIndex % 3 === 0 || swiper.activeIndex >= data.length - 3)
    ) {
      loadPage();
    }
  };

  const handleVideoPlay = (attachmentId: any) => {
    setCurrentlyPlayingId((prev: any) =>
      prev === attachmentId ? null : attachmentId
    );
  };

  const toggleDropdown = (index: number) => {
    setOpenDropdowns((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const dropdownItems = (_video: any, _position: number, _user: any) => [];

  return (
    <section
      aria-label="Match videos"
      className="relative w-full bg-zinc-950 flex flex-col h-[calc(100svh-48px)] md:h-[calc(100vh-65px)]"
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

      {isLoading && data.length === 0 ? (
        <HomeSlideSkeleton />
      ) : (
        <Swiper
          direction="vertical"
          slidesPerView={1}
          mousewheel={true}
          onSlideChange={handleSlideChange}
          modules={[Mousewheel]}
          className="mySwiper w-full h-full"
        >
          {data.map((video, index) => (
            <SwiperSlide key={getKey(video, index)}>
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
            <SwiperSlide key="watch-loading-more">
              <HomeSlideSkeleton />
            </SwiperSlide>
          )}
        </Swiper>
      )}

      {!isLoading && !error && data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">
          No videos found for this match.
        </div>
      )}
    </section>
  );
}