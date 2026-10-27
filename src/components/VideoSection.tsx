"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppSelector } from "@/store/reduxHook";
import OptionTop from "@/common/OptionTop";
import OptionBottom from "@/common/OptionBottom";
import Comments from "@/common/Comments";
import StringHelpers from "@/utils/StringHelpers";
import Video from "./Video";

function getFullscreenElement() {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function requestElementFullscreen(el: HTMLElement) {
  const req =
    el.requestFullscreen?.bind(el) ??
    (el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void })
      .webkitRequestFullscreen?.bind(el);
  if (!req) return Promise.reject(new Error("fullscreen unavailable"));
  return Promise.resolve(req());
}

function exitElementFullscreen() {
  const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> | void };
  const exit = document.exitFullscreen?.bind(document) ?? doc.webkitExitFullscreen?.bind(document);
  if (!exit) return Promise.resolve();
  return Promise.resolve(exit());
}

const VideoSection: React.FC<any> = ({
  score,
  isLiked: externalIsLiked,
  isFollowed: externalIsFollowed,
  endTime,
  onVideoPlay,
  video,
  showLiked = false,
  setOpenDropdowns,
  result,
  toggleDropdown,
  dropdownItems,
  openDropdowns,
  isPlaying,
  positionVideo,
  countLiked,
}) => {
  const main = useAppSelector((state) => state?.main);
  const [commentUserInfo, setCommentUserInfo] = useState<any>({});
  const [showComments, setShowComments] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [nativeFs, setNativeFs] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const userIdLogin = main?.userLogin?.user?.id;
  const socket = main?.socketConfig;
  const isExpanded = overlay || nativeFs;

  const handleToggleComments = (videoData: any) => {
    setCommentUserInfo(videoData);
    setShowComments(true);
  };

  const videoUrl =
    positionVideo === 0
      ? StringHelpers?.getProfile(video?.attachmentInserted)
      : StringHelpers?.getProfile(video?.attachmentMatched);

  const syncNativeFs = () => {
    setNativeFs(getFullscreenElement() === rootRef.current);
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", syncNativeFs);
    document.addEventListener("webkitfullscreenchange", syncNativeFs);
    return () => {
      document.removeEventListener("fullscreenchange", syncNativeFs);
      document.removeEventListener("webkitfullscreenchange", syncNativeFs);
    };
  }, []);

  useEffect(() => {
    if (!overlay) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlay(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [overlay]);

  const toggleExpand = async () => {
    if (nativeFs) {
      await exitElementFullscreen();
      return;
    }
    if (overlay) {
      setOverlay(false);
      return;
    }
    if (!isPlaying) {
      onVideoPlay?.(video);
    }
    const el = rootRef.current;
    if (el) {
      try {
        await requestElementFullscreen(el);
        if (getFullscreenElement() === el) return;
      } catch {
        // CSS overlay fallback when native fullscreen is blocked
      }
    }
    setOverlay(true);
  };

  const section = (
    <div
      ref={rootRef}
      className={
        overlay
          ? "fixed inset-0 z-[300] flex h-svh w-full flex-col bg-black"
          : "relative flex h-full min-h-0 w-full flex-col border-b border-white/10"
      }
    >
      {!isExpanded && (
        <OptionTop
          main={main}
          video={video}
          userIdLogin={userIdLogin}
          positionVideo={positionVideo}
          openDropdowns={openDropdowns}
          score={score}
          setOpenDropdowns={setOpenDropdowns}
          toggleDropdown={toggleDropdown}
          dropdownItems={dropdownItems}
          onExpand={toggleExpand}
          isExpanded={isExpanded}
        />
      )}
      <div className="relative min-h-0 flex-1">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
          <Video
            className="h-full w-full object-contain"
            loop
            playing={isPlaying || overlay}
            handleVideo={() => onVideoPlay(video)}
            url={videoUrl}
            onExitFullscreen={isExpanded ? toggleExpand : undefined}
          />
          {!isExpanded && (
            <OptionBottom
              socket={socket}
              userIdLogin={userIdLogin}
              handleToggleComments={handleToggleComments}
              video={video}
              endTime={endTime}
              result={result}
              showLiked={showLiked}
              externalIsLiked={externalIsLiked}
              positionVideo={positionVideo}
              countLiked={
                positionVideo === 0 ? video?.likeInserted : video?.likeMatched
              }
            />
          )}
        </div>
      </div>
      {!isExpanded && (
        <Comments
          visible={showComments}
          onClose={() => setShowComments(false)}
          video={commentUserInfo}
          positionVideo={positionVideo}
        />
      )}
    </div>
  );

  if (overlay && typeof document !== "undefined") {
    return createPortal(section, document.body);
  }

  return section;
};

export default VideoSection;
