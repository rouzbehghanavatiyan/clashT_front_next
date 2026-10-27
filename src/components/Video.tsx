"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import ReactPlayer from "react-player";
import ZoomOut from "@mui/icons-material/ZoomOut";

function playSafely(el: HTMLMediaElement | null) {
  if (!el) return;
  const result = el.play();
  if (result !== undefined) {
    result.catch(() => {});
  }
}

function getMediaElement(
  ref: React.RefObject<HTMLVideoElement | null>,
): HTMLMediaElement | null {
  const el = ref.current as any;
  if (!el) return null;
  if (typeof HTMLMediaElement !== "undefined" && el instanceof HTMLMediaElement) {
    return el;
  }
  const nested = el.querySelector?.("video, audio");
  return nested instanceof HTMLMediaElement ? nested : null;
}

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
  onExitFullscreen?: () => void;
}

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
  onExitFullscreen,
}) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const seekBarRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekingRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const isMuted = muted || !soundEnabled;
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);

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
    setSoundEnabled(false);
  }, [url]);

  useLayoutEffect(() => {
    const el = getMediaElement(playerRef);
    if (!el) return;
    el.muted = isMuted;
    el.defaultMuted = isMuted;
  }, [isMuted, url]);

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
    setSoundEnabled(true);
    handleVideo?.();
  };

  const syncDuration = () => {
    const el = getMediaElement(playerRef);
    if (el?.duration && Number.isFinite(el.duration)) {
      setDuration(el.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (seekingRef.current) return;
    const el = getMediaElement(playerRef);
    if (!el?.duration || !Number.isFinite(el.duration)) return;
    setPlayed(el.currentTime / el.duration);
    setDuration(el.duration);
  };

  const seekToFraction = (fraction: number) => {
    const next = Math.min(1, Math.max(0, fraction));
    setPlayed(next);
    const el = getMediaElement(playerRef);
    if (!el?.duration || !Number.isFinite(el.duration)) return;
    el.currentTime = next * el.duration;
  };

  const fractionFromClientX = (clientX: number) => {
    const bar = seekBarRef.current;
    if (!bar) return played;
    const rect = bar.getBoundingClientRect();
    if (rect.width <= 0) return played;
    return (clientX - rect.left) / rect.width;
  };

  const beginSeek = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    seekingRef.current = true;
    clearHideTimer();
    setShowControls(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    seekToFraction(fractionFromClientX(e.clientX));
  };

  const moveSeek = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!seekingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    seekToFraction(fractionFromClientX(e.clientX));
  };

  const endSeek = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!seekingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    seekToFraction(fractionFromClientX(e.clientX));
    seekingRef.current = false;
    if (playing) scheduleHide();
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
          muted={isMuted}
          volume={isMuted ? 0 : 1}
          autoPlay={playing && isMuted}
          onEnded={onEnded}
          onError={() => {
            const el = getMediaElement(playerRef);
            if (!playing || !el) return;
            el.muted = true;
            playSafely(el);
          }}
          onReady={() => {
            setReady(true);
            setBuffering(false);
            syncDuration();
            const el = getMediaElement(playerRef);
            if (playing && el) {
              el.muted = isMuted;
              playSafely(el);
            }
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
        className={`pointer-events-none absolute inset-0 bg-black/10 transition-opacity duration-300 dark:bg-black/35 ${
          playing && ready ? "opacity-0" : "opacity-100"
        }`}
      />

      {onExitFullscreen && (
        <button
          type="button"
          aria-label="Exit fullscreen"
          onClick={(e) => {
            e.stopPropagation();
            onExitFullscreen();
          }}
          className="absolute right-3 top-3 z-[5] inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65"
        >
          <ZoomOut sx={{ fontSize: 20 }} />
        </button>
      )}

      {buffering && (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-white" />
        </div>
      )}

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 z-[20] px-3 pb-2 pt-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          ref={seekBarRef}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration) || 0}
          aria-valuenow={Math.round(currentTime)}
          className="video-seek swiper-no-swiping"
          style={{ ["--played" as string]: `${played * 100}%` }}
          onPointerDown={beginSeek}
          onPointerMove={moveSeek}
          onPointerUp={endSeek}
          onPointerCancel={endSeek}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") seekToFraction(played + 0.05);
            if (e.key === "ArrowLeft") seekToFraction(played - 0.05);
          }}
        />
      </div>
    </div>
  );
};

export default Video;
