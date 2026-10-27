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

  useEffect(() => {
    const token = getAccessToken();
    if (!token && isProtectedRoute(pathname)) {
      router.replace("/login");
      return;
    }
    if (token && isAuthPage) {
      router.replace("/");
    }
  }, [isAuthPage, pathname, router]);

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col min-w-0 md:pl-60">
        <Header />
        <main className="flex-1 pb-12 md:pb-0">{children}</main>
        <Footer />
      </div>
      <BottomTabBar />
    </div>
  );
};
