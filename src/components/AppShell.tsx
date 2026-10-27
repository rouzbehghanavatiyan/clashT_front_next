"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomTabBar } from "./BottomTabBar";
import { Sidebar } from "./Sidebar";
import { isProtectedRoute, isPublicRoute } from "@/lib/navigation";
import { getAccessToken } from "@/services/tokenService";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = isPublicRoute(pathname);

  const lockPageScroll = pathname.startsWith("/support");
  const isWatchDetailPage = pathname.startsWith("/watch/");

  useEffect(() => {
    const token = getAccessToken();
    if (!token && isProtectedRoute(pathname)) {
      router.replace("/login");
      return;
    }
    if (token && isAuthPage && pathname !== "/offline") {
      router.replace("/");
    }
  }, [isAuthPage, pathname, router]);

  useEffect(() => {
    if (!lockPageScroll) return;
    const html = document.documentElement;
    const { overflow: htmlOverflow } = html.style;
    const { overflow: bodyOverflow } = document.body.style;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [lockPageScroll]);

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div
      className={`flex bg-gray-50 text-gray-900 ${
        lockPageScroll ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      <Sidebar />
      <div
        className={`flex flex-1 flex-col min-w-0 md:pl-60 ${
          lockPageScroll ? "h-screen overflow-hidden" : "min-h-screen"
        }`}
      >
        <Header />
        <main
          className={`flex-1 min-h-0 ${
            isWatchDetailPage ? "pb-0" : "pb-8 md:pb-0"
          } ${lockPageScroll ? "overflow-hidden" : ""}`}
        >
          {children}
        </main>
      </div>
      {!isWatchDetailPage && <BottomTabBar />}
    </div>
  );
};
