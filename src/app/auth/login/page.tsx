import type { Metadata } from "next";
import LoginPage from "@/features/auth/pages/LoginPage";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your PropSpace X account.",
};

export default function Page() {
  return <LoginPage />;
}
