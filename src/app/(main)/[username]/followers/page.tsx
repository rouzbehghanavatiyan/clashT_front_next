import type { Metadata } from "next";
import FollowersClient from "@/components/profile/FollowersClient";
import { createMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return createMetadata({
    title: `${username} followers`,
    description: `People following @${username} on Clash Talent.`,
    path: `/${encodeURIComponent(username)}/followers`,
  });
}

export default function FollowersPage() {
  return <FollowersClient />;
}
