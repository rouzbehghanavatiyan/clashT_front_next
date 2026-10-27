"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import ImageRank from "@/components/ImageRank";
import MessageInput from "@/common/MessageInput";
import { useTheme } from "@/components/ThemeProvider";
import { markAsRead, userMessages } from "@/services/chat.service";
import { markSenderAsRead } from "@/store/slices/chatSlice";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { getImageUrl } from "@/utils/fileHelper";
import { socket } from "@/lib/socket";
import ChatHeader from "./ChatHeader";
import SmartText from "./SmartText";

interface MessageType {
  id?: string | number;
  tempId?: string;
  userProfile?: string;
  senderId: string | number;
  receiveId: string | number;
  content: string;
  time: string;
  createdAt?: string;
  userNameSender?: string;
  isRead?: boolean;
}

const PAGE_SIZE = 10;

const EMOJI_ONLY_REGEX =
  /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\u200d|\ufe0f|\p{Emoji_Modifier}|\s)+$/u;

function isEmojiOnly(text: string) {
  const t = text?.trim();
  return !!t && EMOJI_ONLY_REGEX.test(t);
}

function formatTime(dateInput?: string): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toTimeString().slice(0, 5);
}

function mergeDescending(
  prev: MessageType[],
  fetched: MessageType[],
): MessageType[] {
  const existingIds = new Set(
    prev.filter((m) => m.id != null).map((m) => String(m.id)),
  );

  const toAdd = fetched.filter(
    (m) => m.id == null || !existingIds.has(String(m.id)),
  );

  const merged = [...prev, ...toAdd];

  return merged.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.time).getTime();
    const timeB = new Date(b.createdAt || b.time).getTime();
    return timeB - timeA;
  });
}

export default function PrivateChat() {
  const params = useParams<{ userId: string }>();
  const searchParams = useSearchParams();
  const id = params?.userId;
  const userName = searchParams.get("userName") || "";
  const profile = searchParams.get("profile") || "";
  const score = searchParams.get("score");
  const userScore = Number(score);
  const main = useAppSelector((state) => state?.main);
  const userIdLogin = main?.userLogin?.user?.id;
  const reciveUserId = id;
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [title, setTitle] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const userProfile = getImageUrl(userInfo?.profile);
  const otherUserProfile = profile ? getImageUrl(profile) : "";
  const isInitialLoadRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const dispatch = useAppDispatch();
  const paginationRef = useRef({ skip: 0, take: PAGE_SIZE });

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = 0;
    });
  };

  const triggerMarkAsRead = useCallback(async () => {
    if (!userIdLogin || !reciveUserId) return;
    try {
      if (!socket.connected) socket.connect();
      socket.emit("mark_messages_as_read", {
        sender: reciveUserId,
        receiver: userIdLogin,
      });

      const postData = {
        senderId: Number(reciveUserId),
        receiveId: Number(userIdLogin),
      };
      await markAsRead(postData);
      dispatch(markSenderAsRead(String(reciveUserId)));
    } catch (err) {
      console.error("Error triggering markAsRead:", err);
    }
  }, [userIdLogin, reciveUserId, dispatch]);

  const sendMessage = (override?: string) => {
    const trimmed = (override ?? title).trim();
    if (!trimmed || !userIdLogin || !reciveUserId) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const now = new Date();

    const serverMessage = {
      sender: userIdLogin,
      recieveId: reciveUserId,
      receiveId: reciveUserId,
      content: trimmed,
      userProfile: userInfo?.profile || "",
      userNameSender: userInfo?.userName || userInfo?.user?.userName || "",
      tempId,
    };

    const optimisticMessage: MessageType = {
      tempId,
      senderId: userIdLogin,
      receiveId: reciveUserId,
      content: trimmed,
      time: formatTime(now.toISOString()),
      createdAt: now.toISOString(),
      userProfile: userInfo?.profile || "",
      isRead: false,
    };

    if (!socket.connected) socket.connect();
    socket.emit("send_message", serverMessage);
    setMessages((prev) => [optimisticMessage, ...prev]);

    if (override === undefined) setTitle("");
    setShowStickers(false);
    scrollToBottom();
  };

  const handleEmojiSelect = (item: any) => {
    const value =
      typeof item === "string"
        ? item
        : item?.emoji ?? item?.native ?? item?.url ?? item?.uri ?? "";
    if (value) setTitle((prev) => prev + value);
  };

  const handleMessageSentAck = useCallback((data: any) => {
    if (!data?.tempId) return;
    setMessages((prev) =>
      prev.map((msg) =>
        msg.tempId === data.tempId
          ? {
              ...msg,
              id: data.id,
              createdAt: data.createdAt || msg.createdAt,
              time: data.createdAt ? formatTime(data.createdAt) : msg.time,
            }
          : msg,
      ),
    );
  }, []);

  const handleReciveMessage = useCallback(
    (data: any) => {
      const sender = String(data.senderId ?? data.sender);
      const receiver = String(data.receiveId ?? data.recieveId);
      const currentLogin = String(userIdLogin);
      const currentOther = String(reciveUserId);

      const shouldShow =
        (sender === currentLogin && receiver === currentOther) ||
        (receiver === currentLogin && sender === currentOther);

      if (!shouldShow) return;
      if (sender === currentLogin) return;

      const createdAt = data.createdAt || data.time || new Date().toISOString();

      const normalizedMsg: MessageType = {
        id: data.id,
        tempId: data.tempId,
        senderId: sender,
        receiveId: receiver,
        content: data.content ?? data.title ?? "",
        time: formatTime(createdAt),
        createdAt,
        userProfile: data.userProfile || "",
        isRead: data.isRead ?? false,
      };

      if (sender === currentOther) {
        triggerMarkAsRead();
      }
      setMessages((prev) => [normalizedMsg, ...prev]);
      scrollToBottom();
    },
    [userIdLogin, reciveUserId, triggerMarkAsRead],
  );

  const handleMessagesReadEvent = useCallback(
    (data: { sender: string | number; receiver: string | number }) => {
      if (String(data.receiver) === String(reciveUserId)) {
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg.senderId) === String(userIdLogin)
              ? { ...msg, isRead: true }
              : msg,
          ),
        );
      }
    },
    [reciveUserId, userIdLogin],
  );

  const getMessages = useCallback(
    async (isLoadMore = false) => {
      if (!userIdLogin || !reciveUserId) return;
      if (isLoadMore && (!hasMoreRef.current || isLoadingMoreRef.current))
        return;

      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
          isLoadingMoreRef.current = true;
        } else {
          setIsInitialLoading(true);
        }

        const res = await userMessages(
          Number(userIdLogin),
          Number(reciveUserId),
          paginationRef.current.skip,
          paginationRef.current.take,
        );

        const payload = res?.data ?? res;
        const rawMessages = payload?.messages || [];

        const fetched: MessageType[] = rawMessages.map((m: any) => {
          const createdAt = m.createdAt || m.time || new Date().toISOString();
          const rawContent = m.content;
          const contentText =
            rawContent && typeof rawContent === "object"
              ? rawContent.text ?? ""
              : rawContent ?? m.title ?? "";
          return {
            id: m.id,
            senderId: m.senderId ?? m.sender,
            receiveId: m.receiveId ?? m.recieveId,
            content: contentText,
            time: formatTime(createdAt),
            createdAt,
            userProfile: m.userProfile,
            isRead: m.isRead ?? false,
          };
        });

        const fetchedHasMore: boolean = payload?.hasMore ?? false;
        hasMoreRef.current = fetchedHasMore;

        setMessages((prev) => mergeDescending(prev, fetched));

        paginationRef.current.skip += fetched.length;
      } catch (error) {
        console.error("getMessages error:", error);
      } finally {
        if (isLoadMore) {
          setIsLoadingMore(false);
          isLoadingMoreRef.current = false;
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [userIdLogin, reciveUserId],
  );

  useEffect(() => {
    if (!userIdLogin || !reciveUserId) return;
    paginationRef.current = { skip: 0, take: PAGE_SIZE };
    isInitialLoadRef.current = true;
    isLoadingMoreRef.current = false;
    hasMoreRef.current = true;

    setMessages([]);
    setIsLoadingMore(false);

    if (!socket.connected) socket.connect();
    socket.emit("join_chat", {
      userId: userIdLogin,
      peerId: reciveUserId,
    });

    getMessages(false).finally(() => {
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 500);
    });
    triggerMarkAsRead();

    socket.on("receive_message", handleReciveMessage);
    socket.on("messages_read", handleMessagesReadEvent);
    socket.on("message_sent_ack", handleMessageSentAck);

    return () => {
      socket.emit("leave_chat", userIdLogin);
      socket.off("receive_message", handleReciveMessage);
      socket.off("messages_read", handleMessagesReadEvent);
      socket.off("message_sent_ack", handleMessageSentAck);
      triggerMarkAsRead();
    };
  }, [
    userIdLogin,
    reciveUserId,
    getMessages,
    handleReciveMessage,
    handleMessagesReadEvent,
    handleMessageSentAck,
    triggerMarkAsRead,
  ]);

  const handleLoadMore = useCallback(() => {
    if (isInitialLoadRef.current) return;
    if (isLoadingMoreRef.current) return;
    if (!hasMoreRef.current) return;
    getMessages(true);
  }, [getMessages]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const distanceFromEnd = el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (distanceFromEnd <= 60) handleLoadMore();
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      style={{ backgroundColor: isDark ? "#121212" : "#fff" }}
    >
      <ChatHeader
        userName={userName}
        userProfile={otherUserProfile || profile}
        score={Number.isFinite(userScore) ? userScore : 0}
      />
      {isInitialLoading ? (
        <div className="flex flex-1 items-center justify-center bg-white dark:bg-zinc-950">
          <CircularProgress size={32} />
        </div>
      ) : (
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto py-2.5"
        >
          {messages.map((item, index) => {
            const isOwn = String(item.senderId) === String(userIdLogin);
            const emojiOnly = isEmojiOnly(item.content);
            const messageAvatar = isOwn
              ? userProfile
              : item.userProfile
                ? getImageUrl(item.userProfile)
                : profile;
            const key =
              item.id != null
                ? `msg-${item.id}`
                : item.tempId != null
                  ? `temp-${item.tempId}`
                  : `idx-${index}`;

            return (
              <div
                key={key}
                className={`flex w-full items-end px-3 py-2 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {!isOwn && (
                  <ImageRank
                    imgSrc={messageAvatar}
                    imgSize={35}
                    score={Number.isFinite(userScore) ? userScore : -1}
                    onClickDisable
                  />
                )}

                <div
                  className={`mx-2 max-w-[75%] rounded-xl px-3 py-2 ${
                    emojiOnly
                      ? "bg-transparent shadow-none"
                      : isOwn
                        ? "bg-white shadow-sm dark:bg-zinc-800"
                        : "bg-gray-100 shadow-sm dark:bg-zinc-800"
                  }`}
                >
                  <SmartText
                    className={`block text-sm text-gray-900 dark:text-gray-100 ${
                      emojiOnly ? "text-[32px] leading-10" : ""
                    }`}
                    style={{
                      direction: "rtl",
                      textAlign: "right",
                    }}
                  >
                    {item.content}
                  </SmartText>
                  <div
                    className={`mt-1 flex items-center gap-1 ${
                      isOwn ? "self-end justify-end" : "justify-start"
                    }`}
                  >
                    <span className="text-[8px] text-gray-400">{item.time}</span>
                    {isOwn && (
                      <span
                        className={`text-[9px] ${
                          item.isRead ? "text-blue-500" : "text-gray-400"
                        }`}
                      >
                        {item.isRead ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>

                {isOwn && (
                  <ImageRank imgSrc={messageAvatar} imgSize={35} onClickDisable />
                )}
              </div>
            );
          })}
          {isLoadingMore ? (
            <div className="flex justify-center py-2">
              <CircularProgress size={20} />
            </div>
          ) : (
            <div className="h-[30px]" />
          )}
        </div>
      )}
      {!isInitialLoading && (
        <div className="pb-[env(safe-area-inset-bottom)]">
          <MessageInput
            title={title}
            setTitle={setTitle}
            handleSendMessage={() => sendMessage()}
            onEmojiSelect={handleEmojiSelect}
            showStickers={showStickers}
            setShowStickers={setShowStickers}
          />
        </div>
      )}
    </div>
  );
}
