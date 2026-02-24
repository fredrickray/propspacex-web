import type { Metadata } from "next";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";

export const metadata: Metadata = {
  title: "Verify Email",
  description:
    "Verify your email address to activate your PropSpace X account.",
};

export default function Page() {
  return <VerifyEmailPage />;
}
