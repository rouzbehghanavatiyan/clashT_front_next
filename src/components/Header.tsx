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
  const showBack = !isMainTabPath(pathname);
  const showOnMobile = showBack && !isWatchDetailPage;

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md overflow-visible ${
        showOnMobile ? "block" : "hidden md:block"
      }`}
    >
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between overflow-visible">
        <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition"
            >
              <ArrowBack />
            </button>
          )}
          {isWatchPage ? (
            <UserSearchInput className="w-full max-w-md" />
          ) : (
            <h1 className="truncate text-lg font-semibold text-gray-900">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center">
          <div className="flex items-center gap-0.5">
            <Link
              href="/chat"
              aria-label="Open chat"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition"
            >
              <ChatBubbleOutline />
            </Link>
            <Link
              href="/settings"
              aria-label="Open settings"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition"
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
