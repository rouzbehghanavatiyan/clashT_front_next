"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import RefreshIcon from "@mui/icons-material/Refresh";


import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { attachmentService } from "@/services/attachment.service";
import { appendWatchData, resetWatchState, setPaginationWatch, setWatchData } from "@/store/slices/mainSlice";
import { stopMatchTimer } from "@/components/TimerForFindMatch";
import VideoGroup from "@/components/VideoGroup";

export default function WatchPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { pagination, data } = useAppSelector((state) => state.main.watchVideo);
    const showTimeout = useAppSelector((state) => state?.video?.showTimeout);
    const showDeactivatedModal = useAppSelector(
        (state) => state?.video?.showDeactivatedModal
    );

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [seed, setSeed] = useState<number>(() =>
        Math.floor(Math.random() * 1000000)
    );

    const bottomObserverRef = useRef<HTMLDivElement | null>(null);

    const generateNewSeed = () => Math.floor(Math.random() * 1000000);

    const handleGetAllMatch = useCallback(
        async (reset = false, customSeed?: number) => {
            if (loading) return;
            if (!reset && !pagination.hasMore) return;

            try {
                setLoading(true);
                const skip = reset ? 0 : pagination.skip;
                const take = pagination.take || 6;
                const activeSeed = customSeed ?? seed;

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
                    })
                );
            } catch (err) {
                console.error("Failed to fetch matches:", err);
            } finally {
                setLoading(false);
            }
        },
        [loading, pagination.hasMore, pagination.skip, pagination.take, seed, dispatch]
    );

    const onRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        const newSeed = generateNewSeed();
        setSeed(newSeed);

        dispatch(resetWatchState());
        dispatch(
            setPaginationWatch({
                take: 10,
                skip: 0,
                hasMore: true,
            })
        );

        await handleGetAllMatch(true, newSeed);
        setRefreshing(false);
    };

    useEffect(() => {
        stopMatchTimer();

        if (!data || data.length === 0) {
            handleGetAllMatch(true);
        }
    }, []);

    useEffect(() => {
        if (loading || !pagination.hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleGetAllMatch(false);
                }
            },
            { threshold: 0.2 }
        );

        const target = bottomObserverRef.current;
        if (target) observer.observe(target);

        return () => {
            if (target) observer.unobserve(target);
        };
    }, [handleGetAllMatch, loading, pagination.hasMore]);

    const handleShowMatch = (item: any) => {
        const inviteId = item?.inviteInserted?.id;

        if (!inviteId) {
            console.warn("inviteId is missing", item);
            return;
        }

        router.push(`/watch/showWatch/${inviteId}`);
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 flex flex-col">
            <div className="flex justify-end p-4 pb-0 max-w-7xl mx-auto w-full">
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={refreshing || loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    title="Refresh List"
                >
                    <RefreshIcon
                        className={`text-sm ${refreshing ? "animate-spin" : ""}`}
                        sx={{ fontSize: 18 }}
                    />
                    <span>Refresh</span>
                </button>
            </div>

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data?.map((item: any, index: number) => {
                        const key = item?.inviteInserted?.id
                            ? String(item.inviteInserted.id)
                            : index.toString();

                        return (
                            <div key={key} className="w-full">
                                <VideoGroup
                                    group={item}
                                    index={index}
                                    measureForTour={index === 0}
                                    onPress={() => handleShowMatch(item)}
                                />
                            </div>
                        );
                    })}
                </div>

                <div
                    ref={bottomObserverRef}
                    className="w-full py-8 flex items-center justify-center min-h-[60px]"
                >
                    {loading && !refreshing && (
                        <CircularProgress size={28} className="text-indigo-600 dark:text-indigo-400" />
                    )}
                </div>
            </main>
            {/* {!loading && data?.length > 0 && <WatchHelper enabled={true} />}
            {showTimeout && <MatchTimeoutModal />}
            {showDeactivatedModal && <DeactivatedModal />} */}
        </div>
    );
}
