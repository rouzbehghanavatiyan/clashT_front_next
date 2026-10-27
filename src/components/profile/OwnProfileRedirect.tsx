"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/reduxHook";
import { getLoggedInUsername, profileHref } from "@/lib/navigation";

export default function OwnProfileRedirect() {
  const router = useRouter();
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const username = getLoggedInUsername(userLogin);

  useEffect(() => {
    if (username) {
      router.replace(profileHref(username));
    }
  }, [username, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
      Opening your profile...
    </div>
  );
}
