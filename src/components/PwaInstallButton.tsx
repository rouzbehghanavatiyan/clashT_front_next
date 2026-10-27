"use client";

import GetAppOutlined from "@mui/icons-material/GetAppOutlined";
import { usePwaInstall } from "@/components/PwaRegister";

type PwaInstallButtonProps = {
  variant: "sidebar" | "header";
};

export default function PwaInstallButton({ variant }: PwaInstallButtonProps) {
  const { showInstallEntry, promptInstall } = usePwaInstall();

  if (!showInstallEntry) return null;

  if (variant === "sidebar") {
    return (
      <div className="mt-auto border-t border-gray-100 px-3 py-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={promptInstall}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-900 dark:hover:text-gray-100"
        >
          <GetAppOutlined />
          <span>Install app</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={promptInstall}
      aria-label="Install app"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 md:hidden dark:text-gray-200 dark:hover:bg-zinc-800"
    >
      <GetAppOutlined />
    </button>
  );
}
