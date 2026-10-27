"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { RsetAllFollowerList } from "@/store/slices/mainSlice";
import { userService } from "@/services/user.service";
import StringHelpers from "@/utils/StringHelpers";

export default function FollowersClient() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const username = params?.username as string;
  const followers =
    useAppSelector((state) => state?.main?.allFollowerList) || [];
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const myUserId = userLogin?.user?.id || userLogin?.id;
  const [isLoading, setIsLoading] = useState(false);

  const fetchFollowers = useCallback(async () => {
    try {
      setIsLoading(true);
      const targetUserId =
        userLogin?.userName === username ||
        userLogin?.user?.userName === username
          ? myUserId
          : username;
      const res = await userService.followerList(targetUserId as number);
      const resData = res?.data?.data || res?.data;
      if (resData) {
        dispatch(RsetAllFollowerList(Array.isArray(resData) ? resData : []));
      }
    } catch (error: any) {
      console.error("Follower list fetch error:", error?.message || error);
    } finally {
      setIsLoading(false);
    }
  }, [username, myUserId, userLogin?.userName, userLogin?.user?.userName, dispatch]);

  useEffect(() => {
    if (username) fetchFollowers();
  }, [username, fetchFollowers]);

  return (
    <main className="w-full max-w-2xl mx-auto min-h-screen bg-white border-x border-gray-100">
      <header className="sticky top-0 z-10 flex items-center gap-4 px-4 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          ←
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">Followers</h1>
          <p className="text-xs text-gray-500">@{username}</p>
        </div>
      </header>

      <section className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : followers.length === 0 ? (
          <p className="text-center py-16 text-gray-400 text-sm">
            No followers yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {followers.map((item: any) => (
              <li
                key={item?.id || item?.userId}
                className="flex items-center justify-between py-3 px-2 rounded-lg"
              >
                <button
                  type="button"
                  className="flex items-center gap-3 text-left"
                  onClick={() =>
                    item?.userName &&
                    router.push(`/${encodeURIComponent(item.userName)}`)
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      StringHelpers.getProfile(item?.profile) ||
                      StringHelpers.getProfile(item?.avatar) ||
                      "/default-avatar.png"
                    }
                    alt={item?.userName || "User"}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">
                      {item?.fullName || item?.userName}
                    </h2>
                    <p className="text-xs text-gray-400">@{item?.userName}</p>
                  </div>
                </button>
                {myUserId !== item?.id && (
                  <span className="px-1 py-1.5 text-xs font-semibold text-white">
                    Follow
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
