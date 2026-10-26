"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { attachmentService } from "@/services/attachment.service";
import {
  appendWatchData,
  resetWatchState,
  setPaginationWatch,
  setWatchData,
} from "@/store/slices/mainSlice";
import { stopMatchTimer } from "@/components/TimerForFindMatch";
import VideoGroup from "@/components/VideoGroup";

export default function WatchFeed() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { pagination, data } = useAppSelector((state) => state.main.watchVideo);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [seed, setSeed] = useState<number | null>(null);
  const bottomObserverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1_000_000));
  }, []);

  const handleGetAllMatch = useCallback(
    async (reset = false, customSeed?: number) => {
      if (loading) return;
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

  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const newSeed = Math.floor(Math.random() * 1_000_000);
    setSeed(newSeed);
    dispatch(resetWatchState());
    dispatch(setPaginationWatch({ take: 10, skip: 0, hasMore: true }));
    await handleGetAllMatch(true, newSeed);
    setRefreshing(false);
  };

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

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col">
      <div className="flex justify-end p-4 pb-0 max-w-7xl mx-auto w-full">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Refresh list"
        >
          <RefreshIcon
            className={refreshing ? "animate-spin" : ""}
            sx={{ fontSize: 18 }}
          />
          <span>Refresh</span>
        </button>
      </div>

      <section aria-label="Talent matchups" className="flex-1 w-full max-w-7xl mx-auto p-4 pb-16">
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((item: any, index: number) => {
            const key = item?.inviteInserted?.id
              ? String(item.inviteInserted.id)
              : `watch-${index}`;

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

        {!loading && !error && data?.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-16">
            No matchups yet. Pull to refresh or create a new clash.
          </p>
        )}

        <div
          ref={bottomObserverRef}
          className="w-full py-8 flex items-center justify-center min-h-[60px]"
        >
          {loading && !refreshing && <CircularProgress size={28} />}
        </div>
      </section>
    </div>
  );
}
