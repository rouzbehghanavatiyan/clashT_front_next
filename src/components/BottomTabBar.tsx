"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeOutlined,
  HomeRounded,
  PlayCircleOutline,
  PlayCircleFilled,
  AddCircleOutline,
  AddCircle,
  EmojiEventsOutlined,
  EmojiEvents,
} from "@mui/icons-material";
import { useAppSelector } from "@/store/reduxHook";
import { MAIN_TABS, isTabActive } from "@/lib/navigation";
import ImageRank from "@/components/ImageRank";
import StringHelpers from "@/utils/StringHelpers";
import { CreateEntryButton } from "@/components/create/CreateEntryButton";

const ICONS: Record<
  string,
  { idle: React.ReactNode; active: React.ReactNode }
> = {
  home: {
    idle: <HomeOutlined fontSize="small" />,
    active: <HomeRounded fontSize="small" />,
  },
  watch: {
    idle: <PlayCircleOutline fontSize="small" />,
    active: <PlayCircleFilled fontSize="small" />,
  },
  create: {
    idle: <AddCircleOutline fontSize="small" />,
    active: <AddCircle fontSize="small" />,
  },
  top: {
    idle: <EmojiEventsOutlined fontSize="small" />,
    active: <EmojiEvents fontSize="small" />,
  },
};

export const BottomTabBar: React.FC = () => {
  const pathname = usePathname();
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const username = userLogin?.user?.userName ?? userLogin?.username;
  const avatarUrl = StringHelpers.getProfile(userLogin?.profile);
  const score = typeof userLogin?.score === "number" ? userLogin.score : -1;
  const profileHref = username
    ? `/${encodeURIComponent(username)}`
    : "/profile";

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"
    >
      <div className="flex h-12 max-w-lg items-center justify-around px-2 mx-auto">
        {MAIN_TABS.map((tab) => {
          const isActive = isTabActive(tab.id, pathname, username);
          const href = tab.id === "profile" ? profileHref : tab.href;
          const icons = ICONS[tab.id];

          const className = `flex flex-1 items-center justify-center py-1 transition-colors ${
            isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
          }`;
          const content =
            tab.id === "profile" ? (
              <span
                className={`overflow-visible rounded-full ${
                  isActive ? "ring-2 ring-blue-600 ring-offset-1" : ""
                }`}
              >
                <ImageRank
                  imgSrc={avatarUrl || undefined}
                  score={score}
                  imgSize={24}
                  userInfo={userLogin}
                  onClickDisable
                />
              </span>
            ) : isActive ? (
              icons.active
            ) : (
              icons.idle
            );

          if (tab.id === "create") {
            return (
              <CreateEntryButton
                key={tab.id}
                aria-label={tab.name}
                aria-current={isActive ? "page" : undefined}
                className={className}
              >
                {content}
              </CreateEntryButton>
            );
          }

          return (
            <Link
              key={tab.id}
              href={href}
              aria-label={tab.name}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
