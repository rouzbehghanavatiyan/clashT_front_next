"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmationNumberOutlined from "@mui/icons-material/ConfirmationNumberOutlined";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Close from "@mui/icons-material/Close";

const PACKS = [50, 10, 5] as const;
type Pack = (typeof PACKS)[number];
type PayMethod = "paypal" | "crypto";

const METHODS: { id: PayMethod; title: string; detail: string }[] = [
  { id: "paypal", title: "PayPal", detail: "Pay with your PayPal account" },
  { id: "crypto", title: "Crypto", detail: "Pay with cryptocurrency" },
];

export default function TicketButton({
  iconSize = "medium",
}: {
  iconSize?: "small" | "medium";
}) {
  const [open, setOpen] = useState(false);
  const [pack, setPack] = useState<Pack | null>(null);
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setPack(null);
    setMethod(null);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Tickets"
        onClick={() => {
          setPack(null);
          setMethod(null);
          setOpen(true);
        }}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800"
      >
        <ConfirmationNumberOutlined fontSize={iconSize} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            data-no-swipe-back
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
            onClick={close}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ticket-dialog-title"
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-white p-5 text-gray-900 shadow-2xl dark:bg-zinc-900 dark:text-gray-100 sm:rounded-3xl"
              style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
            >
              <div className="mb-4 flex items-center gap-2">
                {pack != null && (
                  <button
                    type="button"
                    aria-label="Back to ticket packs"
                    onClick={() => {
                      setPack(null);
                      setMethod(null);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                  >
                    <ArrowBack fontSize="small" />
                  </button>
                )}
                <h2 id="ticket-dialog-title" className="flex-1 text-lg font-bold">
                  {pack == null ? "Tickets" : `${pack} tickets`}
                </h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  <Close fontSize="small" />
                </button>
              </div>

              {pack == null ? (
                <div className="grid gap-3">
                  {PACKS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPack(count)}
                      className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-4 text-left transition hover:border-gray-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                    >
                      <span className="text-base font-semibold">{count} tickets</span>
                      <ConfirmationNumberOutlined fontSize="small" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose how to pay for {pack} tickets.
                  </p>
                  {METHODS.map((item) => {
                    const selected = method === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMethod(item.id)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          selected
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-gray-200 hover:border-gray-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                        }`}
                      >
                        <span className="block text-base font-semibold">{item.title}</span>
                        <span
                          className={`mt-1 block text-xs ${
                            selected ? "text-white/80 dark:text-black/70" : "text-gray-500"
                          }`}
                        >
                          {item.detail}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
