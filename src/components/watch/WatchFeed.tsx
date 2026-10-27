"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import UserSearchInput from "@/components/UserSearchInput";
import PwaInstallButton from "@/components/PwaInstallButton";
import { attachmentService } from "@/services/attachment.service";
import {
  appendWatchData,
  resetWatchState,
  setPaginationWatch,
  setWatchData,
} from "@/store/slices/mainSlice";
import { stopMatchTimer } from "@/components/TimerForFindMatch";
import VideoGroup from "@/components/VideoGroup";

const PULL_THRESHOLD = 64;

export default function WatchFeed() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { pagination, data } = useAppSelector((state) => state.main.watchVideo);
  const unread =
    useAppSelector((state) => state?.main?.unreadMessagesCount) || 0;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [seed, setSeed] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const bottomObserverRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const pullRef = useRef({ startY: 0, active: false });

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1_000_000));
  }, []);

  const handleGetAllMatch = useCallback(
    async (reset = false, customSeed?: number) => {
      if (loading && !reset) return;
      if (!reset && !pagination.hasMore) return;
      const activeSeed = customSeed ?? seed;
      if (activeSeed == null) return;

      try {
        setLoading(true);
        setError("");
        const skip = reset ? 0 : pagination.skip;
        const take = pagination.take || 6;

        const res = await attachmentService.attachmentList({
          skip,
          take,
          subCatId: 0,
          seed: activeSeed,
        });

        const newData = res?.data?.data || [];

        if (reset) {
          dispatch(setWatchData(newData));
        } else {
          dispatch(appendWatchData(newData));
        }

        dispatch(
          setPaginationWatch({
            take,
            skip: skip + take,
            hasMore: newData.length === take,
          }),
        );
      } catch (err) {
        console.error("Failed to fetch matches:", err);
        setError("Could not load matches. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [loading, pagination.hasMore, pagination.skip, pagination.take, seed, dispatch],
  );

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    const newSeed = Math.floor(Math.random() * 1_000_000);
    setSeed(newSeed);
    dispatch(resetWatchState());
    dispatch(setPaginationWatch({ take: 6, skip: 0, hasMore: true }));
    await handleGetAllMatch(true, newSeed);
    setRefreshing(false);
  }, [dispatch, handleGetAllMatch, refreshing]);

  useEffect(() => {
    stopMatchTimer();
  }, []);

  useEffect(() => {
    if (seed == null) return;
    if (!data || data.length === 0) {
      handleGetAllMatch(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  useEffect(() => {
    if (loading || !pagination.hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleGetAllMatch(false);
        }
      },
      { threshold: 0.2 },
    );

    const target = bottomObserverRef.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [handleGetAllMatch, loading, pagination.hasMore]);

  const handleShowMatch = (item: any) => {
    const inviteId = item?.inviteInserted?.id;
    if (!inviteId) return;
    router.push(`/watch/${inviteId}`);
  };

  const visibleData = data || [];

  const onTouchStart = (e: React.TouchEvent) => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.scrollTop > 0 || refreshing) return;
    pullRef.current.startY = e.touches[0].clientY;
    pullRef.current.active = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!pullRef.current.active || refreshing) return;
    const scroller = scrollerRef.current;
    if (!scroller || scroller.scrollTop > 0) {
      pullRef.current.active = false;
      setPullDistance(0);
      return;
    }
    const dy = e.touches[0].clientY - pullRef.current.startY;
    if (dy > 0) {
      setPullDistance(Math.min(dy * 0.45, 88));
    } else {
      setPullDistance(0);
    }
  };

  const onTouchEnd = async () => {
    if (!pullRef.current.active) return;
    pullRef.current.active = false;
    if (pullDistance >= PULL_THRESHOLD) {
      setPullDistance(PULL_THRESHOLD);
      await onRefresh();
    }
    setPullDistance(0);
  };

  const pulling = pullDistance > 8 || refreshing;

  return (
    <div
      ref={scrollerRef}
      className="flex h-[calc(100svh-32px)] w-full flex-col overflow-y-auto overscroll-y-contain bg-white text-gray-900 md:h-auto md:min-h-screen md:overscroll-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 md:hidden">
        <Link
          href="/chat"
          aria-label="Messages"
          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-800 hover:bg-gray-100"
        >
          <ChatBubbleOutline fontSize="small" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 min-w-4 rounded-full bg-blue-600 px-1 text-center text-[10px] font-semibold leading-4 text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        <UserSearchInput className="min-w-0 flex-1" compact />
        <PwaInstallButton variant="header" />
      </header>

      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-150 md:hidden"
        style={{ height: pulling ? pullDistance : 0 }}
        aria-hidden={!pulling}
      >
        <CircularProgress size={22} />
      </div>

      <section
        aria-label="Talent matchups"
        className="mx-auto w-full max-w-7xl flex-1 p-[3px] pb-16 md:p-4"
      >
        {error && (
          <p role="alert" className="mb-4 px-4 pt-4 text-sm text-red-600 md:px-0 md:pt-0">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-[3px] lg:grid-cols-3">
          {visibleData.map((item: any, index: number) => {
            const key = [
              item?.inviteInserted?.id ?? "x",
              item?.inviteMatched?.id ?? "x",
              item?.attachmentInserted?.attachmentId ??
                item?.attachmentInserted?.id ??
                "x",
              item?.attachmentMatched?.attachmentId ??
                item?.attachmentMatched?.id ??
                "x",
              index,
            ].join("-");

            return (
              <article key={key} className="w-full">
                <VideoGroup
                  group={item}
                  index={index}
                  measureForTour={index === 0}
                  onPress={() => handleShowMatch(item)}
                />
              </article>
            );
          })}
        </div>

        {!loading && !error && visibleData.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-500">
            No matchups yet. Pull down to refresh or create a new clash.
          </p>
        )}

        <div
          ref={bottomObserverRef}
          className="flex min-h-[60px] w-full items-center justify-center py-8"
        >
          {loading && !refreshing && <CircularProgress size={28} />}
        </div>
      </section>
    </div>
  );
}
