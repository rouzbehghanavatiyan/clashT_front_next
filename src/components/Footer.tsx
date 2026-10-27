import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-200 bg-white py-8 pb-16 md:pb-8 text-gray-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BrandLogo
            size={24}
            className="opacity-90"
            nameClassName="whitespace-nowrap text-sm font-semibold tracking-tight text-gray-800"
          />
          <p>© {new Date().getFullYear()} Clash Talent. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-gray-900 transition">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition">
            Privacy Policy
          </Link>
          <Link href="/support" className="hover:text-gray-900 transition">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
};
