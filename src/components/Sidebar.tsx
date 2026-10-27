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
import { BrandLogo } from "@/components/BrandLogo";
import { CreateEntryButton } from "@/components/create/CreateEntryButton";

const ICONS: Record<
  string,
  { idle: React.ReactNode; active: React.ReactNode }
> = {
  home: {
    idle: <HomeOutlined />,
    active: <HomeRounded />,
  },
  watch: {
    idle: <PlayCircleOutline />,
    active: <PlayCircleFilled />,
  },
  create: {
    idle: <AddCircleOutline />,
    active: <AddCircle />,
  },
  top: {
    idle: <EmojiEventsOutlined />,
    active: <EmojiEvents />,
  },
  profile: {
    idle: <PersonOutline />,
    active: <PersonRounded />,
  },
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const username = userLogin?.user?.userName ?? userLogin?.username;

  return (
    <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 z-40 w-60 border-r border-gray-200 bg-white">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <BrandLogo size={36} />
      </div>
      <nav aria-label="Main" className="flex-1 px-3 py-4 space-y-1">
        {MAIN_TABS.map((tab) => {
          const active = isTabActive(tab.id, pathname, username);
          const icons = ICONS[tab.id];
          const className = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            active
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`;
          const content = (
            <>
              {active ? icons.active : icons.idle}
              <span>{tab.name}</span>
            </>
          );

          if (tab.id === "create") {
            return (
              <CreateEntryButton
                key={tab.id}
                aria-current={active ? "page" : undefined}
                className={className}
              >
                {content}
              </CreateEntryButton>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
