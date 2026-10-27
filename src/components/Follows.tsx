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
  return (
    <button
      type="button"
      onClick={onFollowClick}
      disabled={disabled}
      aria-label={title}
      className={`inline-flex items-center justify-center bg-transparent px-1 py-1 text-xs font-semibold text-white shadow-none transition-opacity duration-150 disabled:opacity-50 select-none hover:opacity-80 ${className}`}
    >
      {title}
    </button>
  );
};

export default React.memo(Follows);
