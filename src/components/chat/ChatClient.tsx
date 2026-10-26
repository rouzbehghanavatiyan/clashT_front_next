"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/reduxHook";

export default function ChatClient() {
  const searchParams = useSearchParams();
  const peerName = searchParams.get("userName");
  const lastMatch = useAppSelector((state) => state?.main?.lastMatch) || [];
  const unread = useAppSelector((state) => state?.main?.unreadMessagesCount) || 0;

  return (
    <section aria-label="Chat" className="max-w-2xl mx-auto p-4 pb-16">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Chat</h2>
        <p className="text-sm text-gray-500 mt-1">
          {unread > 0 ? `${unread} unread messages` : "Message other talents"}
        </p>
      </header>

      {peerName && (
        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Conversation with @{peerName}
        </div>
      )}

      {lastMatch.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm text-gray-600">No conversations yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Start a chat from a profile or a matchup.
          </p>
          <Link
            href="/watch"
            className="inline-flex mt-4 text-sm font-semibold text-blue-600 hover:underline"
          >
            Browse Watch
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
          {lastMatch.map((item: any, index: number) => {
            const name =
              item?.userName || item?.user?.userName || `Match ${index + 1}`;
            const userId = item?.id || item?.userId;
            return (
              <li key={userId || index}>
                <Link
                  href={`/chat/${userId ?? ""}?userName=${encodeURIComponent(name)}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">@{name}</span>
                  <span className="text-xs text-gray-400">Open</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
