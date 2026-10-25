"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { RsetAllFollowerList } from "@/store/slices/mainSlice";
import { followService } from "@/services/follow.service";
import { userService } from "@/services/user.service";
// اگر هوک یا کامپوننت اشتراکی دارید ایمپورت کنید:
// import UserListLayout from "@/components/common/UserListLayout";
// import { useFollow } from "@/hooks/useFollow";

const FollowersPage = () => {
    const router = useRouter();
    const params = useParams();
    const dispatch = useAppDispatch();

    // گرفتن نام کاربری از روت داینامیک: /profile/[username]/followers
    const username = params?.username as string;

    const followers = useAppSelector((state) => state?.main?.allFollowerList) || [];
    const userLogin = useAppSelector((state) => state?.main?.userLogin);
    const myUserId = userLogin?.user?.id || userLogin?.id;

    const [isLoading, setIsLoading] = useState(false);

    const fetchFollowers = useCallback(async () => {
        try {
            setIsLoading(true);

            const targetUserId = userLogin?.userName === username ? myUserId : null;

            // فراخوانی سرویس فالوورها
            const res = await userService.followerList(targetUserId || username);
            const resData = res?.data?.data || res?.data;

            if (resData) {
                dispatch(RsetAllFollowerList(Array.isArray(resData) ? resData : []));
            }
        } catch (error: any) {
            console.error("Follower list fetch error:", error?.message || error);
        } finally {
            setIsLoading(false);
        }
    }, [username, myUserId, userLogin?.userName, dispatch]);

    useEffect(() => {
        if (username) {
            fetchFollowers();
        }
    }, [username, fetchFollowers]);

    return (
        <main className="w-full max-w-2xl mx-auto min-h-screen bg-white dark:bg-gray-900 border-x border-gray-100 dark:border-gray-800">
            {/* هدر صفحه */}
            <header className="sticky top-0 z-10 flex items-center gap-4 px-4 h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => router.back()}
                    aria-label="بازگشت"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                    <svg
                        className="w-5 h-5 text-gray-700 dark:text-gray-200 rtl:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-base font-bold text-gray-900 dark:text-white">فالوورها</h1>
                    <p className="text-xs text-gray-500">@{username}</p>
                </div>
            </header>

            {/* لیست کاربران */}
            <section className="p-4">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : followers.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">
                        هیچ فالووری وجود ندارد.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {followers.map((item: any) => (
                            <li
                                key={item?.id || item?.userId}
                                className="flex items-center justify-between py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 px-2 rounded-lg transition"
                            >
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => router.push(`/profile/${item?.userName}`)}
                                >
                                    <img
                                        src={item?.profile || item?.avatarUrl || "/default-avatar.png"}
                                        alt={item?.userName || "user"}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                    />
                                    <div>
                                        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                            {item?.fullName || item?.userName}
                                        </h2>
                                        <p className="text-xs text-gray-400">@{item?.userName}</p>
                                    </div>
                                </div>

                                {/* دکمه فالو/آنفالو */}
                                {myUserId !== item?.id && (
                                    <button
                                        className="px-4 py-1.5 text-xs font-medium rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                    >
                                        دنبال کردن
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
};

export default FollowersPage;
