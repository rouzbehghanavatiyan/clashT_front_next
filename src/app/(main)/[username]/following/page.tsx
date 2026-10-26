import type { Metadata } from "next";
import FollowersClient from "@/components/profile/FollowersClient";
import { createMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return createMetadata({
    title: `${username} following`,
    description: `Accounts followed by @${username} on Clash Talent.`,
    path: `/${encodeURIComponent(username)}/following`,
  });
}

export default function FollowingPage() {
  return <FollowersClient />;
}
