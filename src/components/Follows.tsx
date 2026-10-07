"use client";

import React from "react";

interface FollowsProps {
  onFollowClick?: () => void;
  title: string;
  className?: string;
  disabled?: boolean;
}

const Follows: React.FC<FollowsProps> = ({
  onFollowClick,
  title,
  className = "",
  disabled = false,
}) => {
  const isUnfollow = title.toLowerCase().includes("unfollow");

  return (
    <button
      type="button"
      onClick={onFollowClick}
      disabled={disabled}
      aria-label={title}
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all duration-150 disabled:opacity-50 select-none ${
        isUnfollow
          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20"
      } ${className}`}
    >
      {title}
    </button>
  );
};

export default React.memo(Follows);
