"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { setShowDeactivatedModal } from "@/store/slices/videoSlice";

export const DeactivatedModal = () => {
    const dispatch = useAppDispatch();
    const showModal = useAppSelector((state) => state.video.showDeactivatedModal);

    const handleClose = () => {
        dispatch(setShowDeactivatedModal(false));
    };

    useEffect(() => {
        if (!showModal) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showModal]);

    if (!showModal) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6 backdrop-blur-[1px] animate-in fade-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-2xl transition-all dark:bg-zinc-900"
            >
                <div className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-2 text-left">
                        <h3 className="text-lg font-bold text-amber-500">
                            Video Deactivated
                        </h3>
                        <p className="text-sm leading-5 text-zinc-700 dark:text-zinc-300">
                            Match search disabled
                        </p>
                    </div>

                    <div className="mt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeactivatedModal;
