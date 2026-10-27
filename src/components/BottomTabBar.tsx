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
  ShowChartOutlined,
  ShowChart,
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
    idle: <HomeOutlined sx={{ fontSize: 26 }} />,
    active: <HomeRounded sx={{ fontSize: 26 }} />,
  },
  watch: {
    idle: <PlayCircleOutline sx={{ fontSize: 26 }} />,
    active: <PlayCircleFilled sx={{ fontSize: 26 }} />,
  },
  create: {
    idle: <AddCircleOutline sx={{ fontSize: 26 }} />,
    active: <AddCircle sx={{ fontSize: 26 }} />,
  },
  top: {
    idle: <ShowChartOutlined sx={{ fontSize: 26 }} />,
    active: <ShowChart sx={{ fontSize: 26 }} />,
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-[0_-6px_16px_rgba(0,0,0,0.35)]"
    >
      <div className="flex h-11 max-w-lg items-center justify-around px-2 mx-auto">
        {MAIN_TABS.map((tab) => {
          const isActive = isTabActive(tab.id, pathname, username);
          const href = tab.id === "profile" ? profileHref : tab.href;
          const icons = ICONS[tab.id];

          const className = `flex flex-1 items-center justify-center py-0 transition-colors ${
            isActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
          }`;
          const content =
            tab.id === "profile" ? (
              <span
                className={`overflow-visible rounded-full ${
                  isActive ? "ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-zinc-950" : ""
                }`}
              >
                <ImageRank
                  imgSrc={avatarUrl || undefined}
                  imgSize={38}
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
