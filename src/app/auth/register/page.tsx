import type { Metadata } from "next";
import RegisterPage from "@/features/auth/pages/RegisterPage";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your PropSpace X account to start browsing verified properties.",
};

export default function Page() {
  return <RegisterPage />;
}
