import type { Metadata } from "next";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your PropSpace X account.",
};

export default function Page() {
  return <ResetPasswordPage />;
}
