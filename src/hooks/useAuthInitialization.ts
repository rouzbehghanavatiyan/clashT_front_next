"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useAppDispatch } from "@/store/reduxHook";
import {
  RsetAllFollowerList,
  RsetAllFollowingList,
  RsetCategory,
  RsetUserId,
  RsetUserLogin,
} from "@/store/slices/mainSlice";
import { categoryService } from "@/services/category.service";
import {
  getAccessToken,
  getRefreshToken,
  removeTokens,
} from "@/services/tokenService";
import { userService } from "@/services/user.service";
import { getUserIdFromToken } from "@/utils/jwt";

export function useAuthInitialization() {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  const loadUserMasterData = useCallback(
    async (targetUserId: number) => {
      if (!targetUserId || Number.isNaN(targetUserId)) return;

      try {
        const [cat, followingRes, followerRes] = await Promise.allSettled([
          categoryService.list(),
          userService.followingList(targetUserId),
          userService.followerList(targetUserId),
        ]);

        if (cat.status === "fulfilled") {
          dispatch(RsetCategory(cat.value?.data?.data || []));
        }
        if (followingRes.status === "fulfilled") {
          dispatch(RsetAllFollowingList(followingRes.value?.data?.data || []));
        }
        if (followerRes.status === "fulfilled") {
          dispatch(RsetAllFollowerList(followerRes.value?.data?.data || []));
        }
      } catch (error) {
        console.error("loadUserMasterData error", error);
      }
    },
    [dispatch],
  );

  const loadCurrentUser = useCallback(
    async (savedToken: string) => {
      try {
        const userIdFromToken = getUserIdFromToken(savedToken);
        if (!userIdFromToken) {
          throw new Error("Invalid user id from token");
        }

        dispatch(RsetUserId(userIdFromToken));

        try {
          const profileRes =
            await userService.profileAttachment(userIdFromToken);
          const userData = profileRes?.data?.data;
          const finalUserId = Number(userData?.user?.id || userIdFromToken);

          dispatch(
            RsetUserLogin({
              ...(userData ?? {}),
              token: savedToken,
              refreshToken: getRefreshToken(),
              userId: finalUserId,
            }),
          );
          await loadUserMasterData(finalUserId);
        } catch (apiError) {
          console.error("API call failed in loadCurrentUser", apiError);
          if (isAxiosError(apiError) && apiError.response?.status === 401) {
            removeTokens();
            dispatch(RsetUserLogin(null));
            dispatch(RsetUserId(null));
            return;
          }
          dispatch(
            RsetUserLogin({
              token: savedToken,
              refreshToken: getRefreshToken(),
              userId: userIdFromToken,
            }),
          );
        }
      } catch (error) {
        console.error("loadCurrentUser error", error);
        removeTokens();
        dispatch(RsetUserLogin(null));
        dispatch(RsetUserId(null));
      }
    },
    [dispatch, loadUserMasterData],
  );

  const initializeAuth = useCallback(async () => {
    try {
      const savedToken = getAccessToken();
      if (!savedToken) {
        dispatch(RsetUserLogin(null));
        dispatch(RsetUserId(null));
        return;
      }
      await loadCurrentUser(savedToken);
    } catch (error) {
      console.error("initializeAuth error", error);
    } finally {
      setIsInitializing(false);
    }
  }, [loadCurrentUser, dispatch]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return { isInitializing };
}
