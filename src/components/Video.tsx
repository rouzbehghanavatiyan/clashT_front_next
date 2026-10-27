"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

interface VideoProps {
  loop?: boolean;
  playing?: boolean;
  playbackRate?: number;
  muted?: boolean;
  url: string;
  onEnded?: () => void;
  className?: string;
  handleVideo?: () => void;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const Video: React.FC<VideoProps> = ({
  loop,
  playing = false,
  playbackRate = 1,
  muted = false,
  url,
  onEnded,
  className,
  handleVideo,
  style,
  width = "100%",
  height = "100%",
}) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setShowControls(false), 1600);
  }, []);

  useEffect(() => {
    setPlayed(0);
    setDuration(0);
    setReady(false);
    setBuffering(true);
    setShowControls(true);
  }, [url]);

  useEffect(() => {
    if (!playing) {
      clearHideTimer();
      setShowControls(true);
      return;
    }
    scheduleHide();
    return clearHideTimer;
  }, [playing, scheduleHide]);

  const revealControls = () => {
    setShowControls(true);
    if (playing) scheduleHide();
  };

  const handleVideoClick = () => {
    handleVideo?.();
  };

  const syncDuration = () => {
    const el = playerRef.current;
    if (el?.duration && Number.isFinite(el.duration)) {
      setDuration(el.duration);
    }
  };

  const handleTimeUpdate = () => {
    const el = playerRef.current;
    if (!el?.duration || seeking) return;
    setPlayed(el.currentTime / el.duration);
    setDuration(el.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fraction = Number(e.target.value);
    setPlayed(fraction);
    const el = playerRef.current;
    if (el?.duration) el.currentTime = fraction * el.duration;
  };

  const currentTime = played * (duration || 0);

  return (
    <div
      className="group/video relative overflow-hidden bg-black"
      style={{ width, height }}
      onMouseMove={revealControls}
      onTouchStart={revealControls}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={playing ? "Pause video" : "Play video"}
        className="absolute inset-0 z-[1] cursor-pointer"
        onClick={handleVideoClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleVideoClick();
          }
        }}
      >
        <ReactPlayer
          ref={playerRef}
          src={url}
          style={{ width: "100%", height: "100%", ...style }}
          className={`pointer-events-none h-full w-full object-contain ${className ?? ""}`}
          playsInline
          playing={playing}
          loop={loop}
          playbackRate={playbackRate}
          muted={muted}
          onEnded={onEnded}
          onReady={() => {
            setReady(true);
            setBuffering(false);
            syncDuration();
          }}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onCanPlay={() => {
            setReady(true);
            setBuffering(false);
            syncDuration();
          }}
          onLoadedMetadata={syncDuration}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      <div
        className={`pointer-events-none absolute inset-0 bg-black/35 transition-opacity duration-300 ${
          playing && ready ? "opacity-0" : "opacity-100"
        }`}
      />

      {buffering && (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-white" />
        </div>
      )}

      {!playing && ready && !buffering && (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/30 backdrop-blur-md">
            <PlayArrowRoundedIcon sx={{ fontSize: 42 }} />
          </span>
        </div>
      )}

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-20 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 z-[4] px-3 pb-2 pt-6 transition-opacity duration-300 ${
          showControls
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium tabular-nums text-white/80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step="any"
          aria-label="Seek"
          value={played}
          onMouseDown={() => setSeeking(true)}
          onTouchStart={() => setSeeking(true)}
          onChange={handleSeek}
          onMouseUp={() => setSeeking(false)}
          onTouchEnd={() => setSeeking(false)}
          className="video-seek"
          style={{ ["--played" as string]: `${played * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Video;
