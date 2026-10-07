"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeOutlined,
  HomeRounded,
  PersonOutline,
  PersonRounded,
  ChatBubbleOutline,
  ChatBubbleRounded,
  ExploreOutlined,
  ExploreRounded,
} from "@mui/icons-material";

const tabs = [
  {
    name: "Home",
    href: "/home",
    icon: <HomeOutlined fontSize="small" />,
    activeIcon: <HomeRounded fontSize="small" />,
  },
  {
    name: "Explore",
    href: "/talents",
    icon: <ExploreOutlined fontSize="small" />,
    activeIcon: <ExploreRounded fontSize="small" />,
  },
  {
    name: "Chat",
    href: "/messages",
    icon: <ChatBubbleOutline fontSize="small" />,
    activeIcon: <ChatBubbleRounded fontSize="small" />,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: <PersonOutline fontSize="small" />,
    activeIcon: <PersonRounded fontSize="small" />,
  },
];

export const BottomTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="relative">
                {isActive ? tab.activeIcon : tab.icon}
              </div>
              <span className="text-[11px] mt-0.5 font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
