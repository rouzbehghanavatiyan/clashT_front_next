"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { RsetMessageModal } from "@/store/slices/mainSlice";
import {
  MATCH_NOTIF,
  showLocalNotification,
} from "@/services/notify.service";

export default function MatchSocketListener() {
  const dispatch = useAppDispatch();
  const userIdLogin = useAppSelector(
    (state) =>
      state.main?.userLogin?.user?.id ||
      state.main?.userLogin?.userId ||
      state.main?.userId,
  );

  useEffect(() => {
    if (!userIdLogin) return;
    const me = Number(userIdLogin);

    const handleReceiveInvite = (data: any) => {
      const involved = [Number(data?.userId), Number(data?.senderUserId)].includes(
        me,
      );
      if (!involved) return;

      dispatch(
        RsetMessageModal({
          show: true,
          icon: "success",
          title: "Match found",
          message: MATCH_NOTIF.message,
          href: MATCH_NOTIF.url,
        }),
      );
      showLocalNotification(
        MATCH_NOTIF.title,
        MATCH_NOTIF.message,
        MATCH_NOTIF.url,
      );
    };

    socket.on("receive_invite", handleReceiveInvite);
    return () => {
      socket.off("receive_invite", handleReceiveInvite);
    };
  }, [userIdLogin, dispatch]);

  return null;
}
