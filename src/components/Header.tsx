"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatBubbleOutline } from "@mui/icons-material";
import {
  getLoggedInUsername,
  pageTitleFromPath,
  profileHref,
  showsChatAction,
} from "@/lib/navigation";
import { useAppSelector } from "@/store/reduxHook";
import ImageRank from "@/components/ImageRank";
import StringHelpers from "@/utils/StringHelpers";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const title = pageTitleFromPath(pathname);
  const showChat = showsChatAction(pathname);
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const username = getLoggedInUsername(userLogin);
  const avatarUrl = StringHelpers.getProfile(userLogin?.profile);
  const score =
    typeof userLogin?.score === "number" ? userLogin.score : -1;
  const href = profileHref(username);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md overflow-visible">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between overflow-visible">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="md:hidden text-lg font-bold tracking-tight text-gray-900"
          >
            Clash<span className="text-blue-600">Talent</span>
          </Link>
          <h1 className="hidden md:block text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {showChat && (
            <Link
              href="/chat"
              aria-label="Open chat"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition"
            >
              <ChatBubbleOutline />
            </Link>
          )}
          <Link
            href="/settings"
            className="hidden sm:inline-flex text-xs font-semibold px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
          >
            Settings
          </Link>
          <Link
            href={href}
            aria-label="Open profile"
            className="inline-flex items-center justify-center overflow-visible rounded-full hover:opacity-90 transition shrink-0"
          >
            <ImageRank
              imgSrc={avatarUrl || undefined}
              score={score}
              imgSize={36}
              userInfo={userLogin}
              onClickDisable
            />
          </Link>
        </div>
      </div>
    </header>
  );
};
