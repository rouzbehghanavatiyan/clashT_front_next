"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmationNumberOutlined from "@mui/icons-material/ConfirmationNumberOutlined";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Close from "@mui/icons-material/Close";
import {
  cryptoService,
  type CryptoNetwork,
  type CryptoOrder,
  type TicketPackage,
} from "@/services/crypto.service";

type PayMethod = "paypal" | "crypto";

const METHODS: { id: PayMethod; title: string; detail: string }[] = [
  { id: "paypal", title: "PayPal", detail: "Pay with your PayPal account" },
  { id: "crypto", title: "Crypto", detail: "USDT on BSC or TRON" },
];

const NETWORKS: { id: CryptoNetwork; title: string; detail: string }[] = [
  { id: "bsc", title: "BNB Smart Chain", detail: "USDT BEP20. Hash starts with 0x" },
  { id: "tron", title: "TRON", detail: "USDT TRC20. 64 character hash" },
];

function readMessage(error: unknown, fallback: string) {
  const data = (error as { response?: { data?: { message?: string } } })?.response?.data;
  return data?.message || fallback;
}

export default function TicketButton({
  iconSize = "medium",
}: {
  iconSize?: "small" | "medium";
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<TicketPackage[]>([]);
  const [tickets, setTickets] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<TicketPackage | null>(null);
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [network, setNetwork] = useState<CryptoNetwork | null>(null);
  const [order, setOrder] = useState<CryptoOrder | null>(null);
  const [txHash, setTxHash] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

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

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setNotice("");
    Promise.allSettled([cryptoService.packages(), cryptoService.tickets()])
      .then(([packageResult, ticketResult]) => {
        if (cancelled) return;
        if (packageResult.status === "fulfilled") {
          const data = packageResult.value?.data?.data;
          setPackages(Array.isArray(data) ? data : []);
        } else {
          setNotice(readMessage(packageResult.reason, "Could not load ticket packs."));
        }
        if (ticketResult.status === "fulfilled") {
          const balance = ticketResult.value?.data?.data?.tickets;
          setTickets(typeof balance === "number" ? balance : null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setPack(null);
    setMethod(null);
    setNetwork(null);
    setOrder(null);
    setTxHash("");
    setNotice("");
  };

  const createOrder = async () => {
    if (!pack || !network) return;
    setBusy(true);
    setNotice("");
    try {
      const res = await cryptoService.createOrder(pack.id, network);
      const data = res?.data?.data as CryptoOrder | undefined;
      if (!data?.orderId || !data.wallet) {
        setNotice(res?.data?.message || "Could not create the order.");
        return;
      }
      setOrder(data);
    } catch (error) {
      setNotice(readMessage(error, "Could not create the order."));
    } finally {
      setBusy(false);
    }
  };

  const verifyPayment = async () => {
    if (!order || !txHash.trim()) {
      setNotice("Paste the transaction hash.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const res = await cryptoService.verify(order.orderId, txHash.trim(), order.network);
      const body = res?.data;
      const paymentStatus = body?.data?.paymentStatus;
      if (paymentStatus === "paid" || body?.status === 0) {
        const nextTickets = body?.data?.tickets;
        if (typeof nextTickets === "number") setTickets(nextTickets);
        setNotice(body?.message || "Payment confirmed.");
        return;
      }
      setNotice(body?.message || "Transaction is not confirmed yet.");
    } catch (error) {
      const response = (error as { response?: { status?: number; data?: { message?: string; data?: { paymentStatus?: string; tickets?: number } } } })?.response;
      if (response?.status === 202 || response?.data?.data?.paymentStatus === "pending") {
        setNotice(response.data?.message || "Transaction is not confirmed yet. Try again in a minute.");
      } else {
        setNotice(readMessage(error, "Payment was not confirmed."));
      }
    } finally {
      setBusy(false);
    }
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Copied.");
    } catch {
      setNotice("Could not copy.");
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Tickets"
        onClick={() => {
          setPack(null);
          setMethod(null);
          setNetwork(null);
          setOrder(null);
          setTxHash("");
          setNotice("");
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
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 text-gray-900 shadow-2xl dark:bg-zinc-900 dark:text-gray-100 sm:rounded-3xl"
              style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
            >
              <div className="mb-4 flex items-center gap-2">
                {(pack != null || order != null) && (
                  <button
                    type="button"
                    aria-label="Back"
                    onClick={() => {
                      if (order) {
                        setOrder(null);
                        setTxHash("");
                        return;
                      }
                      setPack(null);
                      setMethod(null);
                      setNetwork(null);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                  >
                    <ArrowBack fontSize="small" />
                  </button>
                )}
                <h2 id="ticket-dialog-title" className="flex-1 text-lg font-bold">
                  {order
                    ? "Send USDT"
                    : pack
                      ? `${pack.count} tickets`
                      : "Tickets"}
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

              {tickets != null && (
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                  Balance: {tickets} tickets
                </p>
              )}

              {notice && (
                <p className="mb-3 rounded-xl bg-gray-100 px-3 py-2 text-sm dark:bg-zinc-800">
                  {notice}
                </p>
              )}

              {order ? (
                <div className="grid gap-3 text-sm">
                  <p>
                    Send exactly <strong>{order.amount} USDT</strong> ({order.network.toUpperCase()}).
                    A different amount will not match this order.
                  </p>
                  <div className="break-all rounded-2xl border border-gray-200 p-3 dark:border-zinc-700">
                    <span className="block text-xs text-gray-500">Wallet</span>
                    {order.wallet}
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(`${order.amount} ${order.wallet}`)}
                    className="rounded-xl border border-gray-300 px-3 py-2 font-semibold dark:border-zinc-600"
                  >
                    Copy amount and wallet
                  </button>
                  <label className="grid gap-1">
                    <span className="text-xs text-gray-500">Transaction hash</span>
                    <input
                      value={txHash}
                      onChange={(event) => setTxHash(event.target.value)}
                      placeholder={order.network === "bsc" ? "0x..." : "64 hex characters"}
                      className="rounded-xl border border-gray-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={verifyPayment}
                    className="rounded-xl bg-black px-3 py-3 font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black"
                  >
                    {busy ? "Checking..." : "I have paid"}
                  </button>
                </div>
              ) : pack == null ? (
                <div className="grid gap-3">
                  {loading && <p className="text-sm text-gray-500">Loading packs...</p>}
                  {packages.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPack(item);
                        setMethod(null);
                        setNetwork(null);
                        setNotice("");
                      }}
                      className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-4 text-left transition hover:border-gray-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                    >
                      <span className="text-base font-semibold">{item.count} tickets</span>
                      <span className="text-sm text-gray-500">${item.priceUsd}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pay ${pack.priceUsd} for {pack.count} tickets.
                  </p>
                  {METHODS.map((item) => {
                    const selected = method === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setMethod(item.id);
                          setNotice(item.id === "paypal" ? "PayPal is not available yet." : "");
                        }}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          selected
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-gray-200 hover:border-gray-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                        }`}
                      >
                        <span className="block text-base font-semibold">{item.title}</span>
                        <span className={`mt-1 block text-xs ${selected ? "text-white/80 dark:text-black/70" : "text-gray-500"}`}>
                          {item.detail}
                        </span>
                      </button>
                    );
                  })}
                  {method === "crypto" && (
                    <div className="grid gap-2">
                      {NETWORKS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setNetwork(item.id)}
                          className={`rounded-2xl border px-4 py-3 text-left ${
                            network === item.id
                              ? "border-black dark:border-white"
                              : "border-gray-200 dark:border-zinc-700"
                          }`}
                        >
                          <span className="block font-semibold">{item.title}</span>
                          <span className="text-xs text-gray-500">{item.detail}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={!network || busy}
                        onClick={createOrder}
                        className="rounded-xl bg-black px-3 py-3 font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black"
                      >
                        {busy ? "Creating order..." : "Continue"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
