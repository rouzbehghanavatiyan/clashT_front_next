import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Forgot password",
  description: "Reset your Clash Talent password by email.",
  path: "/forgotPassword",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
