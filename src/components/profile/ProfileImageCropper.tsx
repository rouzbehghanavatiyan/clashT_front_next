"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const OUTPUT = 1024;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

interface ProfileImageCropperProps {
  src: string;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
}

export default function ProfileImageCropper({
  src,
  onCancel,
  onConfirm,
}: ProfileImageCropperProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);

  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState(280);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const size = Math.round(
        Math.max(
          160,
          Math.min(320, window.innerWidth - 48, window.innerHeight - 240),
        ),
      );
      setCrop(size);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const cover =
    natural.w > 0 && natural.h > 0 ? crop / Math.min(natural.w, natural.h) : 1;
  const displayW = natural.w * cover * scale;
  const displayH = natural.h * cover * scale;

  const clampOffset = (x: number, y: number, nextScale: number) => {
    const width = natural.w * cover * nextScale;
    const height = natural.h * cover * nextScale;
    const maxX = Math.max(0, (width - crop) / 2);
    const maxY = Math.max(0, (height - crop) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const applyOffset = (x: number, y: number, nextScale = scaleRef.current) => {
    const next = clampOffset(x, y, nextScale);
    offsetRef.current = next;
    setOffset(next);
  };

  const applyScale = (nextScale: number) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    scaleRef.current = clamped;
    setScale(clamped);
    applyOffset(offsetRef.current.x, offsetRef.current.y, clamped);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) {
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        ox: offsetRef.current.x,
        oy: offsetRef.current.y,
      };
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];

    if (points.length >= 2) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      if (!pinchRef.current) {
        pinchRef.current = { distance, scale: scaleRef.current };
      }
      const next = pinchRef.current.scale * (distance / pinchRef.current.distance);
      applyScale(next);
      return;
    }

    pinchRef.current = null;
    if (!dragRef.current) return;
    applyOffset(
      dragRef.current.ox + (event.clientX - dragRef.current.x),
      dragRef.current.oy + (event.clientY - dragRef.current.y),
    );
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    applyScale(scaleRef.current + (event.deltaY < 0 ? 0.08 : -0.08));
  };

  const save = async () => {
    const image = imageRef.current;
    if (!image || natural.w === 0 || saving) return;

    const pixelsPerCss = natural.w / displayW;
    const side = crop * pixelsPerCss;
    const sx = (displayW / 2 - offset.x - crop / 2) * pixelsPerCss;
    const sy = (displayH / 2 - offset.y - crop / 2) * (natural.h / displayH);

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const context = canvas.getContext("2d");
    if (!context) return;

    setSaving(true);
    try {
      context.beginPath();
      context.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
      context.clip();
      context.drawImage(image, sx, sy, side, side, 0, 0, OUTPUT, OUTPUT);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return;
      await onConfirm(new File([blob], "profile.png", { type: "image/png" }));
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      data-no-swipe-back
      className="fixed inset-0 z-[300] flex h-dvh max-h-dvh flex-col bg-black text-white"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <p className="shrink-0 py-3 text-center text-sm font-semibold">
        Move and scale
      </p>

      <div
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={src}
          alt=""
          draggable={false}
          onLoad={(event) => {
            setNatural({
              w: event.currentTarget.naturalWidth,
              h: event.currentTarget.naturalHeight,
            });
          }}
          className="absolute left-1/2 top-1/2 max-w-none select-none"
          style={
            natural.w > 0
              ? {
                  width: displayW,
                  height: displayH,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }
              : { width: 0, height: 0 }
          }
        />

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{
            width: crop,
            height: crop,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)",
          }}
        />
      </div>

      <div className="flex shrink-0 items-center gap-3 px-4 py-3">
        <span className="text-xs text-white/70">Zoom</span>
        <input
          type="range"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={0.01}
          value={scale}
          aria-label="Zoom"
          onChange={(event) => applyScale(Number(event.target.value))}
          className="w-full"
        />
      </div>

      <div
        className="relative z-30 grid shrink-0 grid-cols-2 gap-3 bg-black px-4 pt-1"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-12 rounded-xl border border-white/50 text-base font-semibold text-white disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving || natural.w === 0}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white text-base font-semibold text-black disabled:opacity-100"
        >
          {saving ? (
            <span
              aria-label="Uploading"
              className="h-7 w-7 animate-spin rounded-full border-4 border-black/20 border-t-black"
            />
          ) : (
            "Accept"
          )}
        </button>
      </div>
      {saving && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
          <span
            aria-label="Uploading"
            className="h-16 w-16 animate-spin rounded-full border-4 border-white/30 border-t-white"
          />
        </div>
      )}
    </div>,
    document.body,
  );
}
