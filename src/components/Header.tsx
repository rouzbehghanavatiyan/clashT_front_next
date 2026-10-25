"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/reduxHook";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const userLogin = useAppSelector((s) => s?.main?.userLogin);
  const username = userLogin?.user?.userName ?? userLogin?.username;
  const profileHref = username ? `/${encodeURIComponent(username)}` : "/login";

  const handleOpenVideoPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);
    videoElement.src = objectUrl;

    videoElement.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      const duration = videoElement.duration;

      if (duration > 60) {
        alert(
          `The selected video is ${Math.round(duration)} seconds long. Please choose a video under 1 minute (60 seconds).`
        );
        setSelectedVideo(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setSelectedVideo(file);
        console.log("Valid video selected:", file.name, `${Math.round(duration)}s`);
      }
    };

    videoElement.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      alert("Error reading video metadata. Please try another video.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
  };

  const navItems = [
    { label: "Home", href: "/home" },
    {
      label: "Talents",
      href: "/clashTalent",
      onClick: handleOpenVideoPicker,
    },
    {
      label: "Watch",
      href: "/watch",
    },

    { label: "Messages", href: "/messages" },
    { label: "Profile", href: profileHref },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      {/* Hidden File Input for Video Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Clash<span className="text-blue-600">Talent</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = item.href ? pathname.startsWith(item.href) : false;

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={`text-sm font-medium transition-colors cursor-pointer ${isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {item.label}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors ${isActive
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="hidden sm:inline-flex text-xs font-semibold px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
          >
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
};
