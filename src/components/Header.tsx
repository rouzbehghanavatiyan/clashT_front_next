"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowBack, ChatBubbleOutline, Settings } from "@mui/icons-material";
import { isMainTabPath, pageTitleFromPath } from "@/lib/navigation";
import { useAppSelector } from "@/store/reduxHook";
import ImageRank from "@/components/ImageRank";
import UserSearchInput from "@/components/UserSearchInput";
import StringHelpers from "@/utils/StringHelpers";
import PwaInstallButton from "@/components/PwaInstallButton";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitleFromPath(pathname);
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const username = userLogin?.user?.userName ?? userLogin?.username;
  const avatarUrl = StringHelpers.getProfile(userLogin?.profile);
  const score =
    typeof userLogin?.score === "number" ? userLogin.score : -1;
  const profileHref = username
    ? `/${encodeURIComponent(username)}`
    : "/profile";
  const isWatchPage = pathname === "/watch";
  const isWatchDetailPage = pathname.startsWith("/watch/");
  const isChatThreadPage = /^\/chat\/.+/.test(pathname);
  const unread =
    useAppSelector((state) => state?.main?.unreadMessagesCount) || 0;
  const showBack = !isMainTabPath(pathname);
  const showOnMobile = showBack && !isWatchDetailPage && !isChatThreadPage;

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md overflow-visible dark:border-zinc-800 dark:bg-zinc-950/80 ${
        isChatThreadPage
          ? "hidden"
          : showOnMobile
            ? "block"
            : "hidden md:block"
      }`}
    >
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between overflow-visible">
        <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800"
            >
              <ArrowBack />
            </button>
          )}
          {isWatchPage ? (
            <UserSearchInput className="w-full max-w-md" />
          ) : (
            <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center">
          <div className="flex items-center gap-0.5">
            <Link
              href="/chat"
              aria-label="Open chat"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800"
            >
              <ChatBubbleOutline />
              {unread > 0 && (
                <span className="absolute right-1 top-1 min-w-4 rounded-full bg-blue-600 px-1 text-center text-[10px] font-semibold leading-4 text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Link
              href="/settings"
              aria-label="Open settings"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800"
            >
              <Settings />
            </Link>
            <PwaInstallButton variant="header" />
          </div>
          <Link
            href={profileHref}
            aria-label="Open profile"
            className="ml-5 hidden items-center justify-center overflow-visible rounded-full hover:opacity-90 transition shrink-0 md:inline-flex"
          >
            <ImageRank
              imgSrc={avatarUrl || undefined}
              score={score}
              imgSize={50}
              userInfo={userLogin}
              onClickDisable
            />
          </Link>
        </div>
      </div>
    </header>
  );
};
