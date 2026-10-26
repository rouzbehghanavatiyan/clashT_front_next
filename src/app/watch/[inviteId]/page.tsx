import type { Metadata } from "next";
import WatchPlayer from "@/components/watch/WatchPlayer";
import { createMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ inviteId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { inviteId } = await params;
  return createMetadata({
    title: `Watch match ${inviteId}`,
    description: "Play this talent matchup on Clash Talent.",
    path: `/watch/${inviteId}`,
  });
}

export default async function WatchMatchPage({ params }: Props) {
  const { inviteId } = await params;
  return <WatchPlayer inviteId={inviteId} />;
}
