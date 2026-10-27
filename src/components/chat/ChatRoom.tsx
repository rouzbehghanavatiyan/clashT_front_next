"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import UserListLayout from "@/common/UserListLayout";
import { allUserMessagese } from "@/services/chat.service";
import {
  markSenderAsRead,
  setChatUsersPage,
} from "@/store/slices/chatSlice";
import {
  setUnreadMessagesCount,
} from "@/store/slices/mainSlice";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { getImageUrl } from "@/utils/fileHelper";

const PAGE_SIZE = 10;

interface MessageData {
  id?: string;
  sender: string;
  recipient?: string;
  recieveId?: string;
  receiveId?: string;
  userNameSender?: string;
  userName?: string;
  score?: number;
  unreadCount?: number;
  isReadChat?: boolean;
  [key: string]: any;
}

const ChatRoom: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const main = useAppSelector((state) => state?.main);
  const userSender = useAppSelector((state) => state.chat.users) || [];
  const chatListLoaded = useAppSelector((state) => state.chat.loaded);
  const skip = useAppSelector((state) => state.chat.skip);
  const hasMore = useAppSelector((state) => state.chat.hasMore);
  const unreadTotal = useAppSelector((state) => state.main.unreadMessagesCount) || 0;
  const userIdLogin = main?.userLogin?.user?.id;

  const [isLoading, setIsLoading] = useState(!chatListLoaded);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchingRef = useRef(false);

  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (!userIdLogin || fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        const res = await allUserMessagese(reset ? 0 : skip, PAGE_SIZE);
        const body = res?.data;

        if (body?.status === 0 && Array.isArray(body.data)) {
          dispatch(
            setChatUsersPage({
              data: body.data,
              hasMore: Boolean(body.hasMore),
              reset,
            }),
          );
        } else if (Array.isArray(body?.data)) {
          dispatch(
            setChatUsersPage({
              data: body.data,
              hasMore: Boolean(body.hasMore),
              reset,
            }),
          );
        } else if (Array.isArray(body)) {
          dispatch(
            setChatUsersPage({
              data: body,
              hasMore: body.length >= PAGE_SIZE,
              reset,
            }),
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        fetchingRef.current = false;
      }
    },
    [userIdLogin, skip, dispatch],
  );

  useEffect(() => {
    if (!userIdLogin) return;
    if (chatListLoaded) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetchPage(true).finally(() => setIsLoading(false));
  }, [chatListLoaded, userIdLogin, fetchPage]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || fetchingRef.current) return;
    setIsLoadingMore(true);
    try {
      await fetchPage(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, fetchPage]);

  const handleRefresh = useCallback(async () => {
    if (fetchingRef.current) return;
    setIsRefreshing(true);
    try {
      await fetchPage(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPage]);

  const handleRedirect = (data: MessageData) => {
    const senderStr = String(data.sender || data.id);
    const prevUnread = Number(data.unreadCount || 0);
    dispatch(markSenderAsRead(senderStr));
    if (prevUnread > 0) {
      dispatch(setUnreadMessagesCount(Math.max(0, unreadTotal - prevUnread)));
    }
    const params = new URLSearchParams({
      userName: String(data.userNameSender ?? data.userName ?? ""),
      profile: getImageUrl(data) ?? "",
      score: String(data.score ?? 0),
    });
    router.push(`/chat/${senderStr}?${params.toString()}`);
  };

  const renderEmptyComponent = () => (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
      <ChatBubbleOutline sx={{ fontSize: 48, color: "#9ca3af" }} />
      <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
        Empty messages
      </p>
      <p className="text-sm text-gray-400">No conversations found yet</p>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-[22px] py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-75"
      >
        {isRefreshing ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <>
            <RefreshIcon sx={{ fontSize: 18 }} />
            Refresh
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="h-full min-h-0">
      <UserListLayout
        isLoading={isLoading}
        data={userSender}
        emptyMessage="Empty messages"
        ListEmptyComponent={renderEmptyComponent}
        onItemPress={handleRedirect}
        imgSize={50}
        onEndReached={handleLoadMore}
        isLoadingMore={isLoadingMore}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        keyExtractor={(item: MessageData) => String(item.sender)}
        renderRight={(user: MessageData) => {
          const showBadge = user?.unreadCount && user.unreadCount > 0;
          if (!showBadge) return null;
          return (
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FF3040]" />
          );
        }}
      />
    </div>
  );
};

export default ChatRoom;
