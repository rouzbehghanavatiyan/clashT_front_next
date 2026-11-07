"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { attachmentService } from "@/services/attachment.service";
import { VideoSlide } from "@/components/VideoSlide";
import { HomeSlideSkeleton } from "@/components/home/HomeSlideSkeleton";
import { isMatchActive } from "@/utils/matchTimer";

const FIRST_TAKE = 6;
const NEXT_TAKE = 3;

function normalizeList(payload: any): any[] {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

const itemIdentity = (item: any) =>
  [
    item?.inviteInserted?.id ?? "x",
    item?.inviteMatched?.id ?? "x",
    item?.attachmentInserted?.attachmentId ?? item?.attachmentInserted?.id ?? "x",
    item?.attachmentMatched?.attachmentId ?? item?.attachmentMatched?.id ?? "x",
  ].join("-");

const getKey = (v: any, i: number) => `${i}-${itemIdentity(v)}`;

export default function WatchPlayer({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState("");
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<any>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>(
    {}
  );

  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);
  const dataRef = useRef<any[]>([]);
  const skipRef = useRef(0);
  const roundRef = useRef(0);

  const loadPage = useCallback(async () => {
    if (!inviteId || loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    const myRequestId = ++requestIdRef.current;
    const isInitial = dataRef.current.length === 0;
    const take = isInitial ? FIRST_TAKE : NEXT_TAKE;
    if (isInitial) setIsLoading(true);
    else setIsFetchingMore(true);
    setError("");

    const numericId = Number(inviteId);
    const requestInviteId = Number.isNaN(numericId) ? inviteId : numericId;

    const readSlice = async (skip: number) => {
      const res = await attachmentService.attachmentListByInviteId({
        skip,
        take,
        inviteId: requestInviteId,
      });
      const list = normalizeList(res?.data);
      return list.length > take ? list.slice(skip, skip + take) : list;
    };

    let continueFromStart = false;

    try {
      let skip = skipRef.current;
      let round = roundRef.current;
      let page = await readSlice(skip);

      if (myRequestId !== requestIdRef.current) return;

      if (page.length === 0 && skip > 0) {
        skip = 0;
        round += 1;
        page = await readSlice(0);
        if (myRequestId !== requestIdRef.current) return;
      }

      if (page.length === 0) {
        hasMoreRef.current = false;
        return;
      }

      const reachedEnd = page.length < take;
      skipRef.current = reachedEnd ? 0 : skip + take;
      roundRef.current = reachedEnd ? round + 1 : round;

      const prev = dataRef.current;
      const seen = new Set(prev.map(itemIdentity));
      const incoming =
        round > 0 ? page : page.filter((item) => !seen.has(itemIdentity(item)));
      if (incoming.length > 0) {
        const next = [...prev, ...incoming];
        dataRef.current = next;
        setData(next);
      }

      if (isInitial && page[0]) {
        setCurrentlyPlayingId(page[0]?.attachmentInserted?.attachmentId ?? null);
      }

      continueFromStart = reachedEnd && skip > 0;
    } catch (err) {
      if (myRequestId !== requestIdRef.current) return;
      console.error("Failed to load videos for invite:", err);
      setError("Could not load videos for this match.");
    } finally {
      if (myRequestId === requestIdRef.current) {
        loadingRef.current = false;
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    }

    if (continueFromStart && myRequestId === requestIdRef.current) {
      loadPage();
    }
  }, [inviteId]);

  useEffect(() => {
    dataRef.current = [];
    skipRef.current = 0;
    roundRef.current = 0;
    hasMoreRef.current = true;
    loadingRef.current = false;
    setData([]);
    setCurrentlyPlayingId(null);
    setOpenDropdowns({});
    loadPage();
  }, [inviteId, loadPage]);

  const handleSlideChange = (swiper: SwiperType) => {
    const index = swiper.activeIndex;
    const current = dataRef.current[index];
    setCurrentlyPlayingId(current?.attachmentInserted?.attachmentId ?? null);
    setOpenDropdowns({});

    const threshold = dataRef.current.length - 3;
    if (index >= threshold && hasMoreRef.current && !loadingRef.current) {
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
      className="relative w-full bg-black flex flex-col h-svh md:h-[calc(100vh-65px)]"
    >
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
          noSwipingClass="swiper-no-swiping"
          onSlideChange={handleSlideChange}
          modules={[Mousewheel]}
          className="mySwiper w-full h-full"
        >
          {data.map((video, index) => (
            <SwiperSlide key={getKey(video, index)}>
              <VideoSlide
                showLiked
                endTime={isMatchActive(video) || Boolean(video?.matchEndAt)}
                showScore={true}
                showResult={true}
                showCountLiked={true}
                inviteWatch
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

      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push("/watch");
        }}
        aria-label="Go back"
        className="absolute left-3 top-1/2 z-[80] inline-flex -translate-y-1/2 items-center justify-center bg-transparent p-0 text-white"
      >
        <ArrowBack sx={{ fontSize: 29, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.65))" }} />
      </button>
    </section>
  );
}