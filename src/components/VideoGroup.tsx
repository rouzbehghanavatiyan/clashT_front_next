"use client";

import React, { useEffect, useRef } from "react";
import { getImageUrl } from "@/utils/fileHelper";
import { Icon } from "@/components/Icon";
import { watchTour } from "@/utils/watchTourStore";

interface VideoGroupProps {
  group: any;
  index?: number;
  onPress?: () => void;
  measureForTour?: boolean;
}

const VideoGroup = ({ group, onPress, measureForTour }: VideoGroupProps) => {
  const containerRef = useRef<HTMLButtonElement | null>(null);

  const imageTop = getImageUrl(group?.attachmentInserted);
  const imageBottom = getImageUrl(group?.attachmentMatched);
    
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
      className="relative m-0.5 flex w-full flex-col overflow-hidden rounded-tr-xl rounded-bl-xl bg-black text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        {matchTime && (
          <div
            className="flex items-center justify-center rounded-full border-2 border-white bg-transparent p-1.5"
            style={{
              boxShadow: "0 1px 4.65px rgba(0,0,0,1)",
            }}
          >
            <Icon name="hourglassBottom" size={20} sx={{ color: "#ffffff" }} />
          </div>
        )}
      </div>

      {imageTop ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageTop}
          alt=""
          className="h-[140px] w-full object-cover"
        />
      ) : (
        <div className="h-[140px] w-full bg-black" />
      )}

      {imageBottom ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageBottom}
          alt=""
          className="h-[140px] w-full object-cover"
        />
      ) : (
        <div className="h-[140px] w-full bg-black" />
      )}
    </button>
  );
};

export default VideoGroup;
