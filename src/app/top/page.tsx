import TopList from "@/components/top/TopList";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Top",
  description: "See the highest ranked talents on Clash Talent.",
  path: "/top",
});

export default function TopPage() {
  return <TopList />;
}
