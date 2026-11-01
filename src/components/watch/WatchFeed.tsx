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
  const pullDistanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const skipSeedLoadRef = useRef(false);
  const onRefreshRef = useRef<() => Promise<void>>(async () => {});

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
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    skipSeedLoadRef.current = true;
    setRefreshing(true);
    try {
      const newSeed = Math.floor(Math.random() * 1_000_000);
      setSeed(newSeed);
      dispatch(resetWatchState());
      dispatch(setPaginationWatch({ take: 6, skip: 0, hasMore: true }));
      await handleGetAllMatch(true, newSeed);
    } finally {
      skipSeedLoadRef.current = false;
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [dispatch, handleGetAllMatch]);

  onRefreshRef.current = onRefresh;

  useEffect(() => {
    stopMatchTimer();
  }, []);

  useEffect(() => {
    if (seed == null || skipSeedLoadRef.current) return;
    if (!data || data.length === 0) {
      handleGetAllMatch(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  useEffect(() => {
    const isAtTop = () => {
      const el = scrollerRef.current;
      const innerTop = !el || el.scrollTop <= 2;
      const pageTop = window.scrollY <= 2 && document.documentElement.scrollTop <= 2;
      return innerTop && pageTop;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current || !isAtTop()) return;
      pullRef.current.startY = e.touches[0].clientY;
      pullRef.current.active = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pullRef.current.active || refreshingRef.current) return;
      if (!isAtTop()) {
        pullRef.current.active = false;
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }
      const touch = e.touches[0];
      const dy = touch.clientY - pullRef.current.startY;
      if (dy <= 0) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }
      if (dy > 8) e.preventDefault();
      const next = Math.min(dy * 0.55, 100);
      pullDistanceRef.current = next;
      setPullDistance(next);
    };

    const onTouchEnd = async () => {
      if (!pullRef.current.active) return;
      pullRef.current.active = false;
      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        setPullDistance(56);
        await onRefreshRef.current();
      }
      pullDistanceRef.current = 0;
      setPullDistance(0);
    };

    const optsPassive = { capture: true, passive: true } as const;
    const optsActive = { capture: true, passive: false } as const;
    document.addEventListener("touchstart", onTouchStart, optsPassive);
    document.addEventListener("touchmove", onTouchMove, optsActive);
    document.addEventListener("touchend", onTouchEnd, optsPassive);
    document.addEventListener("touchcancel", onTouchEnd, optsPassive);
    return () => {
      document.removeEventListener("touchstart", onTouchStart, optsPassive);
      document.removeEventListener("touchmove", onTouchMove, optsActive);
      document.removeEventListener("touchend", onTouchEnd, optsPassive);
      document.removeEventListener("touchcancel", onTouchEnd, optsPassive);
    };
  }, []);

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

  const pulling = pullDistance > 8 || refreshing;

  return (
    <div
      ref={scrollerRef}
      className="flex h-full min-h-0 w-full flex-col overflow-y-auto overscroll-y-contain bg-white text-gray-900 dark:bg-zinc-950 dark:text-gray-100"
    >
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
        <UserSearchInput className="min-w-0 flex-1" compact />
        <Link
          href="/chat"
          aria-label="Messages"
          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-800"
        >
          <ChatBubbleOutline fontSize="small" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 min-w-4 rounded-full bg-blue-600 px-1 text-center text-[10px] font-semibold leading-4 text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        <PwaInstallButton variant="header" />
      </header>

      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-150"
        style={{ height: refreshing ? 56 : pulling ? pullDistance : 0 }}
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

        <div className="grid grid-cols-2 gap-[3px] lg:grid-cols-4">
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
