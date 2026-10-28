"use client";

import React, { memo, useCallback, useMemo } from "react";
import VideoSection from "@/components/VideoSection";
import MatchInfoCard, {
  type MatchResult,
} from "@/components/profile/MatchInfoCard";
import TimerTornoment from "@/components/profile/TimerTornoment";

type VideosProfileItemProps = {
  video: any;
  videoLikes?: Record<string, number>;
  currentlyPlayingId?: string | null;
  onPlay?: (videoId: string | null) => void;
  onMatchExpired?: () => void;
  openDropdowns?: Record<string | number, boolean>;
  setOpenDropdowns?: React.Dispatch<
    React.SetStateAction<Record<string | number, boolean>>
  >;
  toggleDropdown?: (video: any, index: number) => void;
  dropdownItems?: (data: any, position: number, userSenderId: any) => any[];
};

const VideosProfileItem = ({
  video,
  videoLikes,
  currentlyPlayingId,
  onPlay,
  onMatchExpired,
  openDropdowns,
  setOpenDropdowns,
  toggleDropdown,
  dropdownItems,
}: VideosProfileItemProps) => {
  const endAt = video?.matchEndAt ?? null;
  const showTimer = Boolean(endAt);
  const insertedId = video?.attachmentInserted?.attachmentId;
  const matchedId = video?.attachmentMatched?.attachmentId;
  const inviteId = video?.inviteInserted?.id ?? video?.inviteMatched?.id;

  const insertedLikes = Math.max(
    0,
    (video?.likeInserted ?? 0) +
      (insertedId ? (videoLikes?.[insertedId] ?? 0) : 0),
  );
  const matchedLikes = Math.max(
    0,
    (video?.likeMatched ?? 0) +
      (matchedId ? (videoLikes?.[matchedId] ?? 0) : 0),
  );

  const resultInserted: MatchResult =
    insertedLikes > matchedLikes
      ? "Win"
      : insertedLikes < matchedLikes
        ? "Loss"
        : "Draw";
  const resultMatched: MatchResult =
    matchedLikes > insertedLikes
      ? "Win"
      : matchedLikes < insertedLikes
        ? "Loss"
        : "Draw";

  const videoSections = useMemo(
    () => [
      {
        likeCount: insertedLikes,
        attachment: video?.attachmentInserted,
        position: 0,
        score: video?.scoreInserted,
        result: resultInserted,
        isLiked: video?.likes?.[insertedId]?.isLiked ?? false,
        user: video?.userInserted,
      },
      {
        likeCount: matchedLikes,
        attachment: video?.attachmentMatched,
        position: 1,
        score: video?.scoreMatched,
        result: resultMatched,
        isLiked: video?.likes?.[matchedId]?.isLiked ?? false,
        user: video?.userMatched,
      },
    ],
    [
      video,
      insertedLikes,
      matchedLikes,
      resultInserted,
      resultMatched,
      insertedId,
      matchedId,
    ],
  );

  const handleComplete = useCallback(() => {
    const isAnyPlaying =
      currentlyPlayingId === `${inviteId}-0` ||
      currentlyPlayingId === `${inviteId}-1`;
    if (isAnyPlaying) onPlay?.(null);
    onMatchExpired?.();
  }, [currentlyPlayingId, inviteId, onPlay, onMatchExpired]);

  return (
    <article className="mt-2.5">
      <div className="relative mx-auto w-full max-w-[360px] overflow-hidden bg-black sm:max-w-[420px]">
        {videoSections.map((section) => {
          const videoId = `${inviteId}-${section.position}`;
          const isPlaying = currentlyPlayingId === videoId;
          return (
            <div
              key={videoId}
              className="relative aspect-[200/345] w-full"
            >
              <VideoSection
                showLiked
                endTime={showTimer}
                score={section.score}
                result={section.result}
                countLiked={section.likeCount}
                isLiked={section.isLiked}
                video={video}
                positionVideo={section.position}
                isPlaying={isPlaying}
                onVideoPlay={() => onPlay?.(isPlaying ? null : videoId)}
                toggleDropdown={() => toggleDropdown?.(video, section.position)}
                dropdownItems={() =>
                  dropdownItems?.(video, section.position, section.user)
                }
                openDropdowns={openDropdowns}
                setOpenDropdowns={setOpenDropdowns}
              />
            </div>
          );
        })}
        {showTimer && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-2">
            <div className="pointer-events-auto flex w-[83%] items-center justify-center">
              <TimerTornoment
                endAt={endAt}
                active
                onComplete={handleComplete}
              />
            </div>
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-[360px] sm:max-w-[420px]">
        <MatchInfoCard
          left={{
            userName: video?.userInserted?.userName,
            profile: video?.profileInserted,
            likes: insertedLikes,
            score: video?.scoreInserted ?? 0,
            result: resultInserted,
          }}
          right={{
            userName: video?.userMatched?.userName,
            profile: video?.profileMatched,
            likes: matchedLikes,
            score: video?.scoreMatched ?? 0,
            result: resultMatched,
          }}
          isLive={showTimer}
        />
      </div>
    </article>
  );
};

export default memo(VideosProfileItem);
