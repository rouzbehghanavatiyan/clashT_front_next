import WatchFeed from "@/components/watch/WatchFeed";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Watch",
  description: "Browse side-by-side talent matchups and watch the videos.",
  path: "/watch",
});

export default function WatchPage() {
  return <WatchFeed />;
}
