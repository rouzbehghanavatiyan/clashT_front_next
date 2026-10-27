"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { miscService } from "@/services/misc.service";
import ImageRank from "@/components/ImageRank";
import StringHelpers from "@/utils/StringHelpers";

export default function TopList() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await miscService.topScoreList();
        const list = res?.data?.data ?? res?.data ?? [];
        if (!cancelled) setRows(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load top scores:", err);
        if (!cancelled) setError("Could not load the leaderboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-label="Top talents" className="max-w-3xl mx-auto p-4 pb-16">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Top Talents</h2>
        <p className="text-sm text-gray-500 mt-1">
          Highest scores across Clash Talent.
        </p>
      </header>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-gray-500 py-12 text-center">
          No rankings yet.
        </p>
      )}

      <ol className="space-y-3">
        {rows.map((item: any, index: number) => {
          const username = item?.userName || item?.user?.userName;
          return (
            <li
              key={item?.id || item?.userId || `${username}-${index}`}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-3"
            >
              <span className="w-8 text-center text-sm font-bold text-gray-500">
                {index + 1}
              </span>
              <button
                type="button"
                className="flex flex-1 items-center gap-3 text-left"
                onClick={() => username && router.push(`/${encodeURIComponent(username)}`)}
              >
                <ImageRank
                  score={item?.score ?? 0}
                  imgSrc={
                    StringHelpers.getProfile(item?.profile) ||
                    StringHelpers.getProfile(item?.avatar) ||
                    undefined
                  }
                  onClickDisable
                />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {item?.fullName || username || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Score {item?.score ?? 0}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
