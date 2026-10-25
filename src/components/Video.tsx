"use client";
import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";

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
  const [played, setPlayed] = useState(0);

  const handleVideoClick = () => {
    handleVideo?.();
  };

  const handleTimeUpdate = () => {
    const el = playerRef.current;
    if (!el || !el.duration) return;
    setPlayed(el.currentTime / el.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fraction = parseFloat(e.target.value);
    setPlayed(fraction);
    const el = playerRef.current;
    if (el && el.duration) el.currentTime = fraction * el.duration;
  };

  return (
    <div style={{ position: "relative", width, height }}>
      <div onClick={handleVideoClick} style={{ width, height }}>
        <ReactPlayer
          ref={playerRef}
          src={url}
          style={{ width: "100%", height: "100%", ...style }}
          className={className}
          playsInline
          playing={playing}
          loop={loop}
          playbackRate={playbackRate}
          muted={muted}
          onEnded={onEnded}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      <div className="flex items-center gap-10 z-10 bottom-0 right-0 left-0 absolute controls fade-in">
        <input
          type="range"
          min={0}
          max={1}
          step="any"
          value={played}
          onChange={handleSeek}
          className="seek-bar mb-4"
          style={{ ["--played" as any]: played }}
        />
      </div>
    </div>
  );
};

export default Video;