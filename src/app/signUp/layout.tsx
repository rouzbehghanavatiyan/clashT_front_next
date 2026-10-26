import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Sign up",
  description: "Create a Clash Talent account.",
  path: "/signUp",
  noIndex: true,
});

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
