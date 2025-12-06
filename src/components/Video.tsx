import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";

const Video: React.FC<any> = ({
  loop,
  playing = false,
  playbackRate,
  muted = false,
  url,
  onEnded,
  className,
  handleVideo,
  style,
  width = "100%",
  height = "100%",
}) => {
  const playerRef = useRef<any>(null);
  const [showControls, setShowControls] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleVideoClick = () => {
    setShowControls((prev) => !prev);
    handleVideo();
  };

  const handleProgress = (state: any) => {
    setPlayed(state.played);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setPlayed(seekTime);
    playerRef.current?.seekTo(seekTime, "fraction");
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div style={{ position: "relative", width, height }}>
      <span onClick={handleVideoClick}>
        <ReactPlayer
          ref={playerRef}
          style={style}
          className={className}
          playsinline
          width={width}
          height={height}
          playing={playing}
          loop={loop}
          playbackRate={playbackRate}
          muted={muted}
          onEnded={onEnded}
          onProgress={handleProgress}
          onDuration={handleDuration}
          config={{
            // file: {
            //   attributes: {
            //     playsInline: true,
            //     webkitPlaysInline: true,
            //   },
            //   forceAudio: true, // اضافه کردن این خط
            // },
            youtube: {
              playerVars: {
                showinfo: 1,
                playsinline: 1, // اضافه کردن این خط
              },
            },
            facebook: {
              appId: "12345",
            },
          }}
          url={url}
        />
      </span>
      <div className="flex items-center gap-10 z-10 bottom-0 right-0 left-0  absolute controls fade-in">
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
