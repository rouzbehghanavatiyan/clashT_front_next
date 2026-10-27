"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ImageRank from "@/components/ImageRank";

interface ChatHeaderProps {
  score: number;
  userName: string;
  userProfile: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  userName,
  userProfile,
  score,
}) => {
  const router = useRouter();

  return (
    <div className="flex w-full items-center justify-between bg-white px-3 py-2 shadow-sm dark:bg-zinc-950">
      <div className="flex flex-1 items-center justify-start">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
        >
          <ArrowBack sx={{ fontSize: 26 }} />
        </button>
      </div>
      <div className="flex-[7]">
        <ImageRank
          userName={userName || "Unknown User"}
          imgSrc={userProfile}
          imgSize={60}
          score={score}
          userNameLength={32}
          onClickDisable
        />
      </div>
    </div>
  );
};

export default ChatHeader;
