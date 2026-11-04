"use client";

import React, { useState } from "react";
import BlockIcon from "@mui/icons-material/Block";
import { userUnBlock } from "@/services/user.service";

interface BlockedVideoProps {
  userName?: any;
  userIdLogin?: string | number | null;
  onUnblockSuccess?: () => void;
}

const BlockedVideo: React.FC<BlockedVideoProps> = ({
  userName,
  userIdLogin,
  onUnblockSuccess,
}) => {
  const [isUnblocking, setIsUnblocking] = useState(false);

  const handleUnblock = async () => {
    if (!userName?.id || !userIdLogin || isUnblocking) return;

    try {
      setIsUnblocking(true);
      const res = await userUnBlock({
        blockerId: userIdLogin,
        targetUserId: userName.id,
      });
      const isSuccess =
        res?.data?.status === 0 ||
        res?.data === 0 ||
        res?.data?.statusCode === 200;

      if (isSuccess) {
        window.alert("User unblocked successfully");
        onUnblockSuccess?.();
      } else {
        window.alert(res?.data?.message || "Failed to unblock user");
      }
    } catch (error: any) {
      const serverError = error?.response?.data;
      const errorMsg =
        serverError?.message ||
        serverError?.title ||
        "Something went wrong while unblocking.";

      if (
        error?.response?.status === 400 &&
        typeof errorMsg === "string" &&
        (errorMsg.toLowerCase().includes("not blocked") ||
          errorMsg.toLowerCase().includes("not found"))
      ) {
        window.alert("User is already unblocked.");
        onUnblockSuccess?.();
      } else {
        window.alert(errorMsg);
      }
    } finally {
      setIsUnblocking(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-[40] flex items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-red-400/30 bg-red-500/15">
          <BlockIcon sx={{ fontSize: 36, color: "#ff4d4f" }} />
        </div>
        <p className="mt-2 text-lg font-bold text-[#ff4d4f] opacity-90">
          {userName?.userName
            ? `@${userName.userName} is blocked`
            : "Blocked User"}
        </p>
        <p className="mb-2 text-sm text-gray-300">
          Would you like to unblock this user?
        </p>
        <button
          type="button"
          onClick={handleUnblock}
          disabled={isUnblocking}
          className="mt-2 min-w-[120px] rounded-full bg-[#ff4d4f] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
        >
          {isUnblocking ? "Unblocking..." : "Unblock"}
        </button>
      </div>
    </div>
  );
};

export default BlockedVideo;
