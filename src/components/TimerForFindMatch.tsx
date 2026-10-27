"use client"

export const MATCHING_DURATION_SECONDS = 120;

let timer: ReturnType<typeof setTimeout> | null = null;

export const startMatchTimer = (callback: () => void) => {
    stopMatchTimer();

    timer = setTimeout(callback, MATCHING_DURATION_SECONDS * 1000);
};

export const stopMatchTimer = () => {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
};