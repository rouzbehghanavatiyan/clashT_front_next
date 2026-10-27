"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SearchRounded from "@mui/icons-material/SearchRounded";
import CircularProgress from "@mui/material/CircularProgress";
import ImageRank from "@/components/ImageRank";
import { userService } from "@/services/user.service";
import StringHelpers from "@/utils/StringHelpers";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 600;

function getUserName(user: any) {
  return (
    user?.userName ||
    user?.user?.userName ||
    user?.fullName ||
    user?.title ||
    "User"
  );
}

export default function UserSearchInput({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      requestIdRef.current += 1;
      setSearchResults([]);
      setShowDropdown(false);
      setIsLoading(false);
      setIsLoadingMore(false);
      setPageNumber(1);
      setHasMore(true);
      loadingMoreRef.current = false;
      return;
    }

    setShowDropdown(true);
    setIsLoading(true);
    const currentRequestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      try {
        const response = await userService.searchUser({
          userNameReq: query,
          pageNumber: 1,
          pageSize: PAGE_SIZE,
        });
        if (currentRequestId !== requestIdRef.current) return;
        const items = response?.data?.data?.items || [];
        setSearchResults(items);
        setPageNumber(1);
        setHasMore(items.length === PAGE_SIZE);
      } catch (error) {
        if (currentRequestId !== requestIdRef.current) return;
        console.error("Error for searching:", error);
        setSearchResults([]);
        setHasMore(false);
      } finally {
        if (currentRequestId === requestIdRef.current) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadMore = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query || isLoading || !hasMore || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    const currentRequestId = requestIdRef.current;
    const nextPage = pageNumber + 1;

    try {
      const response = await userService.searchUser({
        userNameReq: query,
        pageNumber: nextPage,
        pageSize: PAGE_SIZE,
      });
      if (currentRequestId !== requestIdRef.current) return;
      const items: any[] = response?.data?.data?.items || [];
      setSearchResults((prev) => {
        const existingIds = new Set(prev.map((u) => u?.id));
        const fresh = items.filter((u) => !existingIds.has(u?.id));
        return [...prev, ...fresh];
      });
      setPageNumber(nextPage);
      setHasMore(items.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error for load more search:", error);
    } finally {
      loadingMoreRef.current = false;
      if (currentRequestId === requestIdRef.current) setIsLoadingMore(false);
    }
  }, [searchQuery, isLoading, hasMore, pageNumber]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distanceFromEnd = el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (distanceFromEnd <= 24) loadMore();
  };

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleSelectUser = (user: any) => {
    const username = getUserName(user);
    setShowDropdown(false);
    setSearchQuery("");
    if (!username || username === "User") return;
    router.push(`/${encodeURIComponent(username)}`);
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <label className="relative block min-w-0">
        <span className="sr-only">Search by username</span>
        <SearchRounded
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          sx={{ fontSize: compact ? 18 : 20 }}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim()) setShowDropdown(true);
          }}
          placeholder="Search by username"
          className={`w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:bg-zinc-900 ${
            compact ? "h-10" : "h-10"
          }`}
        />
      </label>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[60] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <CircularProgress size={22} />
            </div>
          ) : searchResults.length > 0 ? (
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="max-h-[350px] overflow-y-auto"
            >
              {searchResults.map((item, index) => (
                <button
                  key={item?.id ?? `${getUserName(item)}-${index}`}
                  type="button"
                  onClick={() => handleSelectUser(item)}
                  className="flex w-full items-center gap-2.5 border-b border-gray-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <ImageRank
                    imgSrc={StringHelpers.getProfile(item?.profile) || undefined}
                    score={typeof item?.score === "number" ? item.score : -1}
                    imgSize={40}
                    onClickDisable
                  />
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getUserName(item)}
                  </span>
                </button>
              ))}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-3">
                  <CircularProgress size={18} />
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-4 text-center text-[13px] text-gray-500 dark:text-gray-400">
              Not found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
