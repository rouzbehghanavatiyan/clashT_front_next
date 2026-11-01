export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(duration) ? duration : 0);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video duration"));
    };
    video.src = url;
  });
}

export function captureVideoCover(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    let done = false;
    const timeout = window.setTimeout(() => {
      finish(new Error("Could not capture cover"));
    }, 8000);

    const finish = (error?: Error, cover?: File) => {
      if (done) return;
      done = true;
      window.clearTimeout(timeout);
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
      if (cover) resolve(cover);
      else reject(error || new Error("Could not capture cover"));
    };

    const snap = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) {
        finish(new Error("Could not capture cover"));
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        finish(new Error("Could not capture cover"));
        return;
      }
      ctx.drawImage(video, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            finish(new Error("Could not capture cover"));
            return;
          }
          finish(
            undefined,
            new File([blob], "cover.png", { type: "image/png" }),
          );
        },
        "image/png",
        0.92,
      );
    };

    video.addEventListener("error", () =>
      finish(new Error("Could not read video for cover")),
    );
    video.addEventListener("seeked", snap, { once: true });
    video.addEventListener(
      "loadeddata",
      () => {
        const duration = Number.isFinite(video.duration) ? video.duration : 1;
        const time = Math.min(0.4, Math.max(0, duration * 0.05));
        if (Math.abs(video.currentTime - time) < 0.05) snap();
        else video.currentTime = time;
      },
      { once: true },
    );
  });
}
