import SupportPage from "@/components/support/SupportPage";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Support & Contact",
  description: "Contact Clash Talent support or send a message to our team.",
  path: "/support",
});

export default function SupportRoutePage() {
  return <SupportPage />;
}
