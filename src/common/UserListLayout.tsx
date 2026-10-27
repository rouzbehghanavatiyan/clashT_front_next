"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import ImageRank from "@/components/ImageRank";
import Follows from "@/components/Follows";
import StringHelpers from "@/utils/StringHelpers";

interface UserListLayoutProps {
  title?: string;
  isLoading: boolean;
  data: any[];
  emptyMessage: string;
  onBack?: () => void;
  onItemPress?: (item: any) => void;
  renderRight?: (item: any) => React.ReactNode;
  isFollowed?: (id: any) => boolean;
  toggleFollow?: (id: any) => void;
  onUnblock?: (id: any) => void;
  unblockText?: string;
  imgSize?: number;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyExtractor?: (item: any, index: number) => string;
  emptyActionTitle?: string;
}

const getUserId = (user: any) =>
  user?.attachment?.attachmentId ||
  user?.followerId ||
  user?.userId ||
  user?.id ||
  user?.sender;

export default function UserListLayout({
  title,
  isLoading,
  data,
  emptyMessage,
  onBack,
  onItemPress,
  renderRight,
  isFollowed,
  toggleFollow,
  onUnblock,
  unblockText = "Unblock",
  imgSize = 50,
  onEndReached,
  isLoadingMore = false,
  refreshing = false,
  onRefresh,
  keyExtractor,
  emptyActionTitle = "Refresh",
}: UserListLayoutProps) {
  const router = useRouter();

  const handleUserClick = (user: any) => {
    if (onItemPress) {
      onItemPress(user);
      return;
    }

    const userName =
      user?.userName || user?.userNameSender || user?.user?.userName;
    if (userName) {
      router.push(`/${encodeURIComponent(userName)}`);
    }
  };

  const defaultKeyExtractor = useCallback(
    (user: any, index: number) => String(user?.id || getUserId(user) || index),
    [],
  );

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!onEndReached) return;
    const el = event.currentTarget;
    const distanceFromEnd = el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (distanceFromEnd <= 40) onEndReached();
  };

  return (
    <div className="flex h-full min-h-[60vh] flex-col bg-white">
      {title ? (
        <div className="flex items-center gap-2 px-4 py-3 md:hidden">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="rounded-full p-1.5 text-gray-700 hover:bg-gray-100"
            >
              ←
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <CircularProgress size={32} />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
          <p className="text-base font-semibold text-gray-500">{emptyMessage}</p>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-75"
            >
              {refreshing ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <>
                  <RefreshIcon sx={{ fontSize: 18 }} />
                  {emptyActionTitle}
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {data.map((user, index) => {
            const userId = getUserId(user);
            const userName =
              user?.userName || user?.userNameSender || "Unknown User";
            const image =
              StringHelpers.getProfile(user?.attachment || user?.profile) ||
              "";
            const followed = isFollowed ? isFollowed(userId) : false;
            const key = (keyExtractor ?? defaultKeyExtractor)(user, index);

            return (
              <div
                key={key}
                className="flex w-full items-center justify-between border-b border-gray-100 bg-white px-4 py-3"
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => handleUserClick(user)}
                >
                  <ImageRank
                    score={typeof user?.score === "number" ? user.score : 0}
                    imgSize={imgSize}
                    userName={userName}
                    imgSrc={image || undefined}
                    onClickDisable
                  />
                </button>

                <div className="z-10 flex items-center gap-2 pl-2">
                  {isFollowed && toggleFollow && (
                    <Follows
                      title={followed ? "Unfollow" : "Follow"}
                      onFollowClick={() => toggleFollow(userId)}
                      className="rounded-full bg-blue-600 px-3 py-1.5 text-white"
                    />
                  )}
                  {onUnblock && (
                    <Follows
                      title={unblockText}
                      onFollowClick={() => onUnblock(userId)}
                      className="rounded-full bg-blue-600 px-3 py-1.5 text-white"
                    />
                  )}
                  {renderRight ? renderRight(user) : null}
                </div>
              </div>
            );
          })}
          {isLoadingMore && (
            <div className="flex h-12 items-center justify-center">
              <CircularProgress size={20} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
