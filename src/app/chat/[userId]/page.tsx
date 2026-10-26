import { Suspense } from "react";
import ChatClient from "@/components/chat/ChatClient";
import { createMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { userId } = await params;
  return createMetadata({
    title: "Chat",
    description: "Private conversation on Clash Talent.",
    path: `/chat/${userId}`,
    noIndex: true,
  });
}

export default function ChatUserPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading chat...</div>}>
      <ChatClient />
    </Suspense>
  );
}
