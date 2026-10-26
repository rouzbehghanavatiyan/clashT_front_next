import { Suspense } from "react";
import ChatClient from "@/components/chat/ChatClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Chat",
  description: "Message other talents on Clash Talent.",
  path: "/chat",
  noIndex: true,
});

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading chat...</div>}>
      <ChatClient />
    </Suspense>
  );
}
