"use client";

import { useSyncExternalStore } from "react";

export type WatchTourStep = "card" | null;
export type Rect = { x: number; y: number; width: number; height: number };

const STORAGE_KEY = "watch_intro_seen_v2";

type State = {
  step: WatchTourStep;
  rect?: Rect;
};

let state: State = { step: null };
let dismissed = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

export const watchTour = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  getState: () => state,

  async start() {
    if (state.step || dismissed) return;
    if (typeof window === "undefined") return;

    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen && !dismissed) {
        set({ step: "card" });
      }
    } catch (e) {
      console.error("WatchTour start error:", e);
    }
  },

  async finish() {
    dismissed = true;
    set({ step: null });
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      console.error("WatchTour finish error:", e);
    }
  },

  async reset() {
    dismissed = false;
    set({ step: null });
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      await this.start();
    } catch (e) {
      console.error("Reset Tour Error:", e);
    }
  },

  setRect(rect: Rect) {
    const old = state.rect;
    if (
      old &&
      old.x === rect.x &&
      old.y === rect.y &&
      old.width === rect.width &&
      old.height === rect.height
    ) {
      return;
    }
    set({ rect });
  },
};

const serverSnapshot: State = { step: null };

export const useWatchTour = () =>
  useSyncExternalStore(
    watchTour.subscribe,
    watchTour.getState,
    () => serverSnapshot,
  );
