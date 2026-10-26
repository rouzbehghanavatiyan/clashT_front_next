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
  const currentId = useAppSelector((s) => s.main.userLogin);

  useEffect(() => {
    const token = getAccessToken();

    if (currentId || !token) return;
    console.log("currentIdcurrentIdcurrentIdcurrentId",currentId);
    
    (async () => {
      try {
        const res = await userService.profileAttachment(currentId);
        const profileData = res?.data?.data;
        dispatch(
          RsetUserLogin({
            ...(profileData ?? {}),
            token,
            refreshToken: getRefreshToken(),
          }),
        );
      } catch (e) {
        console.error("restore session failed", e);
      }
    })();
  }, [currentId, dispatch]);

  return <>{children}</>;
};
