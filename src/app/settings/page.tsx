"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import BedtimeOutlinedIcon from "@mui/icons-material/BedtimeOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import BlockIcon from "@mui/icons-material/Block";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function SettingPage() {
    const router = useRouter();

    const [theme, setTheme] = useState<"light" | "dark">("light");
    const isDark = theme === "dark";

    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogoutConfirm = async () => {
        try {
            setIsLoggingOut(true);

            const savedTheme = localStorage.getItem("@app_theme");
            localStorage.clear();
            if (savedTheme) {
                localStorage.setItem("@app_theme", savedTheme);
            }

            setLogoutDialogOpen(false);
            router.replace("/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleCategoryClick = (name: string) => {
        switch (name) {
            case "Signout":
                setLogoutDialogOpen(true);
                break;
            case "Profile":
                router.push("/settings/editProfile");
                break;
            case "Support":
                router.push("/support");
                break;
            case "Block list":
                router.push("/block-list");
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 flex flex-col">
            {/* Header / MainTitle */}
            <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-4 py-3 backdrop-blur-md">
                <button
                    onClick={() => router.back()}
                    className="rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
                    aria-label="Back"
                >
                    <ArrowBackIcon sx={{ fontSize: 22 }} />
                </button>
                <h1 className="text-lg font-semibold">Settings</h1>
            </header>

            {/* Main Content */}
            <main className="mx-auto w-full max-w-2xl flex-1 p-4">
                <div className="divide-y divide-gray-100 dark:divide-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    {/* Profile */}
                    <button
                        onClick={() => handleCategoryClick("Profile")}
                        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    >
                        <div className="flex items-center gap-3">
                            <PersonOutlineIcon className="text-gray-500 dark:text-gray-400" sx={{ fontSize: 22 }} />
                            <span className="text-sm font-medium">Profile</span>
                        </div>
                        <ChevronRightIcon className="text-gray-400" sx={{ fontSize: 20 }} />
                    </button>

                    {/* Theme Switcher */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <WbSunnyOutlinedIcon className="text-gray-500 dark:text-gray-400" sx={{ fontSize: 22 }} />
                            <span className="text-sm font-medium">Theme</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setTheme("light")}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${!isDark
                                    ? "border border-green-600 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                    : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                <WbSunnyOutlinedIcon sx={{ fontSize: 16 }} />
                                Light
                            </button>
                            <button
                                type="button"
                                onClick={() => setTheme("dark")}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${isDark
                                    ? "border border-green-600 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                    : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                <BedtimeOutlinedIcon sx={{ fontSize: 16 }} />
                                Dark
                            </button>
                        </div>
                    </div>

                    {/* Support */}
                    <button
                        onClick={() => handleCategoryClick("Support")}
                        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    >
                        <div className="flex items-center gap-3">
                            <SupportAgentIcon className="text-gray-500 dark:text-gray-400" sx={{ fontSize: 22 }} />
                            <span className="text-sm font-medium">Support</span>
                        </div>
                        <ChevronRightIcon className="text-gray-400" sx={{ fontSize: 20 }} />
                    </button>

                    {/* Block list */}
                    <button
                        onClick={() => handleCategoryClick("Block list")}
                        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    >
                        <div className="flex items-center gap-3">
                            <BlockIcon className="text-gray-500 dark:text-gray-400" sx={{ fontSize: 22 }} />
                            <span className="text-sm font-medium">Block list</span>
                        </div>
                        <ChevronRightIcon className="text-gray-400" sx={{ fontSize: 20 }} />
                    </button>

                    {/* Sign out */}
                    <button
                        onClick={() => handleCategoryClick("Signout")}
                        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-red-50/50 dark:hover:bg-red-950/20"
                    >
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                            <LogoutIcon sx={{ fontSize: 22 }} />
                            <span className="text-sm font-medium">Sign out</span>
                        </div>
                        <ChevronRightIcon className="text-red-400" sx={{ fontSize: 20 }} />
                    </button>
                </div>
            </main>
            {logoutDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div
                        className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                            Sign out
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Are you sure you want to sign out? Your local session data will be removed.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={isLoggingOut}
                                onClick={() => setLogoutDialogOpen(false)}
                                className="rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isLoggingOut}
                                onClick={handleLogoutConfirm}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {isLoggingOut ? "Signing out..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
