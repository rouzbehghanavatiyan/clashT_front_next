"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/reduxHook";
import { setPreparedMedia } from "@/store/slices/videoSlice";
import { createMediaObjectUrl } from "@/utils/createMediaFile";
import { getVideoDuration } from "@/utils/media";

const MAX_VIDEO_SECONDS = 60;

export function useCreateMediaPick() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState("");

  const openPicker = useCallback(() => {
    setError("");
    inputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) {
        const message = "Please choose a photo or a video.";
        setError(message);
        window.alert(message);
        return;
      }

      if (isVideo) {
        try {
          const duration = await getVideoDuration(file);
          if (duration > MAX_VIDEO_SECONDS) {
            const message = "Video must be under 1 minute.";
            setError(message);
            window.alert(message);
            return;
          }
        } catch {
          const message = "Could not read this video. Please try another file.";
          setError(message);
          window.alert(message);
          return;
        }
      }

      setError("");
      const src = createMediaObjectUrl(file);
      dispatch(
        setPreparedMedia({
          src,
          mimeType: file.type,
          fileName: file.name,
        }),
      );
      router.push("/create");
    },
    [dispatch, router],
  );

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*,video/*"
      className="hidden"
      onChange={onFileChange}
    />
  );

  return { openPicker, fileInput, error };
}
