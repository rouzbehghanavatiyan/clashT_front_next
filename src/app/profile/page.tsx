import OwnProfileRedirect from "@/components/profile/OwnProfileRedirect";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Profile",
  description: "View your Clash Talent profile.",
  path: "/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return <OwnProfileRedirect />;
}
