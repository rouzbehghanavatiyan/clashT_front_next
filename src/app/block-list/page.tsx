import BlockListPage from "@/components/blockList/BlockListPage";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Block List",
  description: "Manage users you have blocked on Clash Talent.",
  path: "/block-list",
  noIndex: true,
});

export default function BlockListRoutePage() {
  return <BlockListPage />;
}
