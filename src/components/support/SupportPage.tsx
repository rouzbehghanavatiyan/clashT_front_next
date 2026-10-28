"use client";

import { useRouter } from "next/navigation";
import SupportForm from "./SupportForm";

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
      <main className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col overflow-hidden p-4">
        <h1 className="mb-3 text-lg font-semibold md:hidden">Support & Contact</h1>
        <SupportForm
          className="h-full"
          onCancel={() => router.back()}
        />
      </main>
    </div>
  );
}
