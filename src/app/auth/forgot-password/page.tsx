import type { Metadata } from "next";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your PropSpace X account password.",
};

export default function Page() {
  return <ForgotPasswordPage />;
}
