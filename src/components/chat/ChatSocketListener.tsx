"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { socket } from "@/lib/socket";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { unreadCount, parseUnreadCount } from "@/services/chat.service";
import { incrementSenderUnread } from "@/store/slices/chatSlice";
import {
  incrementUnreadCount,
  setUnreadMessagesCount,
} from "@/store/slices/mainSlice";

export default function ChatSocketListener() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const userIdLogin = useAppSelector(
    (state) => state.main?.userLogin?.user?.id,
  );

  useEffect(() => {
    if (!userIdLogin) return;

    if (!socket.connected) socket.connect();
    socket.emit("register_user", userIdLogin);

    unreadCount(userIdLogin)
      .then((payload) => {
        dispatch(setUnreadMessagesCount(parseUnreadCount(payload)));
      })
      .catch(() => {});
  }, [userIdLogin, dispatch]);

  useEffect(() => {
    if (!userIdLogin) return;

    const handleReceive = (data: any) => {
      const sender = String(data?.senderId ?? data?.sender ?? "");
      const receiver = String(data?.receiveId ?? data?.recieveId ?? "");
      const me = String(userIdLogin);
      if (!sender || sender === me) return;
      if (receiver && receiver !== me) return;

      const threadMatch = pathname.match(/^\/chat\/([^/?]+)/);
      if (threadMatch && String(threadMatch[1]) === sender) return;

      dispatch(incrementSenderUnread(sender));
      dispatch(incrementUnreadCount());
    };

    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [userIdLogin, pathname, dispatch]);

  return null;
}
