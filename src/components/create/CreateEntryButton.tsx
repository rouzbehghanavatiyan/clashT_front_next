"use client";

import React from "react";
import { useCreateMediaPick } from "@/hooks/useCreateMediaPick";

type CreateEntryButtonProps = {
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
  "aria-current"?: "page" | undefined;
};

export function CreateEntryButton({
  className,
  children,
  ...rest
}: CreateEntryButtonProps) {
  const { openPicker, fileInput, error } = useCreateMediaPick();

  return (
    <>
      {fileInput}
      <button type="button" className={className} onClick={openPicker} {...rest}>
        {children}
      </button>
      {error && (
        <span className="sr-only" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
