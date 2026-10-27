import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-200 bg-white py-8 pb-16 text-xs text-gray-500 md:pb-8 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BrandLogo
            size={24}
            className="opacity-90"
            nameClassName="whitespace-nowrap text-sm font-semibold tracking-tight text-gray-800 dark:text-gray-100"
          />
          <p>© {new Date().getFullYear()} Clash Talent. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="transition hover:text-gray-900 dark:hover:text-gray-100">
            Terms of Service
          </Link>
          <Link href="/privacy" className="transition hover:text-gray-900 dark:hover:text-gray-100">
            Privacy Policy
          </Link>
          <Link href="/support" className="transition hover:text-gray-900 dark:hover:text-gray-100">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
};
