import Image from "next/image";
import { createMetadata, SITE_NAME } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Offline",
  description: "You are currently offline. Reconnect to keep using Clash Talent.",
  path: "/offline",
  noIndex: true,
});

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-zinc-950">
      <Image
        src="/icons/icon-192.png"
        alt={SITE_NAME}
        width={64}
        height={64}
        className="rounded-full"
        priority
      />
      <p className="mt-3 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Clash<span className="text-blue-600">Talent</span>
      </p>
      <h1 className="mt-6 text-xl font-bold text-gray-900 dark:text-gray-100">You are offline</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        Check your connection and try again. Previously visited pages may still be
        available.
      </p>
      <a
        href="/"
        className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </a>
    </div>
  );
}
