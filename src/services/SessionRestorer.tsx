"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { RsetUserLogin } from "@/store/slices/mainSlice";
import { getAccessToken, getRefreshToken, getUserID } from "@/services/tokenService";
import { userService } from "@/services/user.service";

export const SessionRestorer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const currentId = useAppSelector((s) => s.main.userLogin?.user?.id);

  useEffect(() => {
    const token = getAccessToken();
    const userId = getUserID();

    if (currentId || !token || !userId) return;

    (async () => {
      try {
        const res = await userService.profileAttachment(userId);
        const profileData = res?.data?.data;
        dispatch(
          RsetUserLogin({
            ...(profileData ?? {}),
            token,
            refreshToken: getRefreshToken(),
            userId,
          }),
        );
      } catch (e) {
        console.error("restore session failed", e);
      }
    })();
  }, [currentId, dispatch]);

  return <>{children}</>;
};
