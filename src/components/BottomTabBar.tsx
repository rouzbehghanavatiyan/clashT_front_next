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
  PersonOutline,
  PersonRounded,
} from "@mui/icons-material";
import { useAppSelector } from "@/store/reduxHook";
import { MAIN_TABS, isTabActive } from "@/lib/navigation";

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
  profile: {
    idle: <PersonOutline fontSize="small" />,
    active: <PersonRounded fontSize="small" />,
  },
};

export const BottomTabBar: React.FC = () => {
  const pathname = usePathname();
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const username = userLogin?.user?.userName ?? userLogin?.username;

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {MAIN_TABS.map((tab) => {
          const isActive = isTabActive(tab.id, pathname, username);
          const icons = ICONS[tab.id];
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {isActive ? icons.active : icons.idle}
              <span className="text-[11px] mt-0.5 font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
