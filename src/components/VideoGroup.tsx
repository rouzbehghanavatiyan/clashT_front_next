"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import StringHelpers from "@/utils/StringHelpers";
import { watchTour } from "@/utils/watchTourStore";

interface VideoGroupProps {
    group: any;
    index?: number;
    onPress?: () => void;
    measureForTour?: boolean;
}

const VideoGroup = ({
    group,
    onPress,
    measureForTour,
}: VideoGroupProps) => {
    const containerRef = useRef<HTMLButtonElement | null>(null);

    const imageTop = StringHelpers.getProfile(group?.attachmentInserted);
    const imageBottom = StringHelpers.getProfile(group?.attachmentMatched);

    const matchedInsertDate = group?.inviteMatched?.insertDate;
    const insertedInsertDate = group?.inviteInserted?.insertDate;

    const hasValidInsertDate = (value: unknown) =>
        value !== undefined && value !== null && value !== -1 && value !== "";

    const matchTime =
        hasValidInsertDate(matchedInsertDate) ||
        hasValidInsertDate(insertedInsertDate);

    useEffect(() => {
        if (!measureForTour || !containerRef.current) return;

        const timer = setTimeout(() => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect && rect.width && rect.height) {
                watchTour.setRect({
                    x: rect.left + window.scrollX,
                    y: rect.top + window.scrollY,
                    width: rect.width,
                    height: rect.height,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [measureForTour]);
    return (
        <button
            ref={containerRef}
            type="button"
            onClick={onPress}
            className="group relative flex w-full flex-col gap-px overflow-hidden rounded-tr-2xl rounded-bl-2xl bg-zinc-900 text-left transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2">
                {matchTime && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black/30 backdrop-blur-[2px] shadow-lg drop-shadow-md">
                        <HourglassBottomIcon
                            sx={{ fontSize: 20, color: "#ffffff" }}
                            className="animate-pulse"
                        />
                    </div>
                )}
            </div>

            <div className="relative aspect-[4/5] w-full bg-zinc-800 lg:h-36 lg:aspect-auto">
                {imageTop ? (
                    <Image
                        src={imageTop}
                        alt={`${group?.userInserted?.userName || "Challenger"} photo`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                        No photo
                    </div>
                )}
            </div>

            <div className="relative aspect-[4/5] w-full bg-zinc-800 lg:h-36 lg:aspect-auto">
                {imageBottom ? (
                    <Image
                        src={imageBottom}
                        alt={`${group?.userMatched?.userName || "Opponent"} photo`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                        No photo
                    </div>
                )}
            </div>
        </button>
    );
};

export default VideoGroup;
