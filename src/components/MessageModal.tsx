"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DoneIcon from "@mui/icons-material/Done";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { RsetMessageModal } from "@/store/slices/mainSlice";

const MessageModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const modal = useAppSelector((state) => state?.main?.messageModal);
  if (!modal?.show) return null;

  const isDanger = modal.icon === "danger";

  const handleClose = () => {
    const href = modal.href;
    dispatch(RsetMessageModal({ show: false, href: "", message: "" }));
    if (href) router.push(href);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${
            isDanger ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {isDanger ? (
            <PriorityHighIcon sx={{ fontSize: 26 }} />
          ) : (
            <DoneIcon sx={{ fontSize: 26 }} />
          )}
        </div>
        <h2
          className={`text-lg font-bold ${
            isDanger ? "text-red-600" : "text-emerald-600"
          }`}
        >
          {modal.title}
        </h2>
        {modal.message ? (
          <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-gray-300">
            {modal.message}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="min-w-20 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
