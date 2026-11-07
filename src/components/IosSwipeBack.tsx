"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function isAppleTouch() {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOS || iPadOS;
}

export function IosSwipeBack({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const shell = document.getElementById("app-swipe-root");
    if (!shell) return;
    shell.style.transition = "none";
    shell.style.transform = "";
  }, [pathname]);

  useEffect(() => {
    if (!enabled || !isAppleTouch()) return;
    const shell = document.getElementById("app-swipe-root");
    if (!shell) return;

    let startX = 0;
    let startY = 0;
    let dx = 0;
    let tracking = false;
    let axis: "h" | "v" | null = null;

    const reset = () => {
      tracking = false;
      axis = null;
      dx = 0;
    };

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, .video-seek, [data-no-swipe-back]")) {
        return;
      }
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      dx = 0;
      axis = null;
      tracking = true;
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const x = touch.clientX - startX;
      const y = touch.clientY - startY;

      if (!axis) {
        if (Math.abs(x) < 12 && Math.abs(y) < 12) return;
        axis = Math.abs(x) > Math.abs(y) * 1.2 ? "h" : "v";
      }
      if (axis !== "h" || x >= 0) return;

      dx = x;
      event.preventDefault();
      event.stopPropagation();
      shell.style.transition = "none";
      shell.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    const onEnd = () => {
      if (!tracking) return;
      const width = window.innerWidth;
      const goBack = axis === "h" && dx <= -Math.min(88, width * 0.22);
      const dragged = dx;
      reset();
      if (!goBack) {
        if (dragged < 0) {
          shell.style.transition = "transform 0.2s ease";
          shell.style.transform = "translate3d(0, 0, 0)";
        }
        return;
      }

      shell.style.transition = "transform 0.2s ease";
      shell.style.transform = `translate3d(-${width}px, 0, 0)`;
      window.setTimeout(() => {
        if (window.history.length > 1) router.back();
        else if (pathname.startsWith("/watch/")) router.push("/watch");
        else router.push("/");
      }, 180);
    };

    document.addEventListener("touchstart", onStart, { capture: true, passive: true });
    document.addEventListener("touchmove", onMove, { capture: true, passive: false });
    document.addEventListener("touchend", onEnd, { capture: true });
    document.addEventListener("touchcancel", onEnd, { capture: true });

    return () => {
      document.removeEventListener("touchstart", onStart, { capture: true });
      document.removeEventListener("touchmove", onMove, { capture: true });
      document.removeEventListener("touchend", onEnd, { capture: true });
      document.removeEventListener("touchcancel", onEnd, { capture: true });
      shell.style.transition = "none";
      shell.style.transform = "";
    };
  }, [enabled, pathname, router]);

  return null;
}
