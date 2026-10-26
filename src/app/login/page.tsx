import LoginForm from "@/components/auth/LoginForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Sign in",
  description: "Sign in to Clash Talent to watch matchups and create challenges.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginForm />;
}
